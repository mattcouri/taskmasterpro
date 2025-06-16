import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, Plus, Eye, EyeOff, Copy, Edit, Trash2, Search, Globe, Mail, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Password } from "@shared/schema";

const passwordSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  url: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional(),
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function PasswordTracker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<Password | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: passwords = [], isLoading } = useQuery({
    queryKey: ["/api/passwords"],
    queryFn: async () => {
      const response = await fetch("/api/passwords");
      if (!response.ok) throw new Error("Failed to fetch passwords");
      return response.json() as Promise<Password[]>;
    },
  });

  const createPasswordMutation = useMutation({
    mutationFn: async (data: PasswordForm) => {
      const response = await apiRequest("POST", "/api/passwords", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Password saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save password", variant: "destructive" });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: PasswordForm }) => {
      const response = await apiRequest("PUT", `/api/passwords/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      setDialogOpen(false);
      setEditingPassword(null);
      form.reset();
      toast({ title: "Success", description: "Password updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update password", variant: "destructive" });
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/passwords/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/passwords"] });
      toast({ title: "Success", description: "Password deleted!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete password", variant: "destructive" });
    },
  });

  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      siteName: "",
      url: "",
      username: "",
      email: "",
      password: "",
      notes: "",
    },
  });

  const filteredPasswords = passwords.filter(password =>
    password.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    password.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePasswordVisibility = (id: number) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: `${type} copied to clipboard` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  const handleEdit = (password: Password) => {
    setEditingPassword(password);
    form.reset({
      siteName: password.siteName,
      url: password.url || "",
      username: password.username || "",
      email: password.email || "",
      password: password.password,
      notes: password.notes || "",
    });
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPassword(null);
    form.reset();
    setDialogOpen(true);
  };

  const onSubmit = (data: PasswordForm) => {
    if (editingPassword) {
      updatePasswordMutation.mutate({ id: editingPassword.id, data });
    } else {
      createPasswordMutation.mutate(data);
    }
  };

  const generatePassword = () => {
    const length = 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue("password", password);
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Password Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Securely store and manage your passwords
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white" onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Password
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPassword ? "Edit Password" : "Add New Password"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site/App Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Gmail, Facebook" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password *</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline" onClick={generatePassword}>
                          Generate
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full gradient-primary text-white">
                  {editingPassword ? "Update Password" : "Save Password"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-panel mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Passwords Grid */}
      {filteredPasswords.length === 0 ? (
        <Card className="glass-panel">
          <CardContent className="text-center py-12">
            <Key className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              {searchTerm ? "No passwords found" : "No passwords stored"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm 
                ? "Try adjusting your search terms"
                : "Add your first password to get started"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPasswords.map((password) => (
            <Card key={password.id} className="glass-panel card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Key className="w-5 h-5 text-primary" />
                    <span className="truncate">{password.siteName}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(password)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deletePasswordMutation.mutate(password.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {password.url && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{password.url}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => window.open(password.url, '_blank')}
                    >
                      <Globe className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {password.username && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{password.username}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(password.username!, "Username")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {password.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{password.email}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(password.email!, "Email")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm">
                    <Key className="w-4 h-4 text-gray-400" />
                    <span className="font-mono">
                      {visiblePasswords.has(password.id) 
                        ? password.password 
                        : "•".repeat(password.password.length)
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility(password.id)}
                    >
                      {visiblePasswords.has(password.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(password.password, "Password")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {password.notes && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {password.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Created: {new Date(password.createdAt).toLocaleDateString()}
                  </span>
                  {password.updatedAt && password.updatedAt !== password.createdAt && (
                    <Badge variant="outline" className="text-xs">
                      Updated
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <Card className="glass-panel mt-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-amber rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                Security Notice
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your passwords are stored locally and encrypted. For enhanced security, 
                consider using a dedicated password manager for sensitive accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
