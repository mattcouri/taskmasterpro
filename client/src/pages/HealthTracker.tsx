import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, Brain, Users, Dumbbell, DollarSign, Plus, TrendingUp, Calendar, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import type { HealthScore } from "@shared/schema";

const healthScoreSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2030),
  spiritualScore: z.number().min(1).max(10),
  mentalScore: z.number().min(1).max(10),
  socialScore: z.number().min(1).max(10),
  physicalScore: z.number().min(1).max(10),
  financialScore: z.number().min(1).max(10),
  notes: z.string().optional(),
});

type HealthScoreForm = z.infer<typeof healthScoreSchema>;

const healthDimensions = [
  {
    id: "spiritualScore",
    name: "Spiritual",
    description: "You with your God/Universe",
    icon: Heart,
    color: "#7C3AED",
    gradient: "gradient-primary",
  },
  {
    id: "mentalScore",
    name: "Mental",
    description: "You with your mind",
    icon: Brain,
    color: "#3B82F6",
    gradient: "gradient-emerald",
  },
  {
    id: "socialScore",
    name: "Social",
    description: "You with other people - family, friends, community, work",
    icon: Users,
    color: "#10B981",
    gradient: "gradient-amber",
  },
  {
    id: "physicalScore",
    name: "Physical",
    description: "You with your body",
    icon: Dumbbell,
    color: "#F59E0B",
    gradient: "gradient-red",
  },
  {
    id: "financialScore",
    name: "Financial",
    description: "You with your resources and ability to go up the Maslow Pyramid",
    icon: DollarSign,
    color: "#EF4444",
    gradient: "gradient-primary",
  },
];

export default function HealthTracker() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: healthScores = [], isLoading: scoresLoading } = useQuery({
    queryKey: ["/api/health-scores"],
    queryFn: async () => {
      const response = await fetch("/api/health-scores");
      if (!response.ok) throw new Error("Failed to fetch health scores");
      return response.json() as Promise<HealthScore[]>;
    },
  });

  const { data: currentScore, isLoading: currentLoading } = useQuery({
    queryKey: ["/api/health-scores", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/health-scores/${selectedMonth}/${selectedYear}`);
      if (!response.ok) throw new Error("Failed to fetch current health score");
      return response.json() as Promise<HealthScore | null>;
    },
  });

  const createHealthScoreMutation = useMutation({
    mutationFn: async (data: HealthScoreForm) => {
      const response = await apiRequest("POST", "/api/health-scores", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health-scores", selectedMonth, selectedYear] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Success", description: "Health scores saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save health scores", variant: "destructive" });
    },
  });

  const updateHealthScoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<HealthScoreForm> }) => {
      const response = await apiRequest("PUT", `/api/health-scores/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/health-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health-scores", selectedMonth, selectedYear] });
      setDialogOpen(false);
      toast({ title: "Success", description: "Health scores updated successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update health scores", variant: "destructive" });
    },
  });

  const form = useForm<HealthScoreForm>({
    resolver: zodResolver(healthScoreSchema),
    defaultValues: {
      month: selectedMonth,
      year: selectedYear,
      spiritualScore: 5,
      mentalScore: 5,
      socialScore: 5,
      physicalScore: 5,
      financialScore: 5,
      notes: "",
    },
  });

  // Prepare data for charts
  const chartData = healthScores
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    })
    .slice(-12) // Last 12 months
    .map(score => ({
      monthYear: `${score.month}/${score.year}`,
      month: new Date(score.year, score.month - 1).toLocaleDateString('en-US', { month: 'short' }),
      spiritual: score.spiritualScore,
      mental: score.mentalScore,
      social: score.socialScore,
      physical: score.physicalScore,
      financial: score.financialScore,
    }));

  const radarData = currentScore ? [
    {
      dimension: "Spiritual",
      score: currentScore.spiritualScore,
      fullMark: 10,
    },
    {
      dimension: "Mental", 
      score: currentScore.mentalScore,
      fullMark: 10,
    },
    {
      dimension: "Social",
      score: currentScore.socialScore,
      fullMark: 10,
    },
    {
      dimension: "Physical",
      score: currentScore.physicalScore,
      fullMark: 10,
    },
    {
      dimension: "Financial",
      score: currentScore.financialScore,
      fullMark: 10,
    },
  ] : [];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    if (score >= 4) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return "Excellent";
    if (score >= 7) return "Good";
    if (score >= 5) return "Fair";
    if (score >= 3) return "Poor";
    return "Critical";
  };

  const calculateOverallScore = (scores: HealthScore) => {
    return Math.round(
      (scores.spiritualScore + scores.mentalScore + scores.socialScore + 
       scores.physicalScore + scores.financialScore) / 5
    );
  };

  const handleEdit = () => {
    if (currentScore) {
      form.reset({
        month: currentScore.month,
        year: currentScore.year,
        spiritualScore: currentScore.spiritualScore,
        mentalScore: currentScore.mentalScore,
        socialScore: currentScore.socialScore,
        physicalScore: currentScore.physicalScore,
        financialScore: currentScore.financialScore,
        notes: currentScore.notes || "",
      });
    } else {
      form.reset({
        month: selectedMonth,
        year: selectedYear,
        spiritualScore: 5,
        mentalScore: 5,
        socialScore: 5,
        physicalScore: 5,
        financialScore: 5,
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: HealthScoreForm) => {
    if (currentScore) {
      updateHealthScoreMutation.mutate({ id: currentScore.id, data });
    } else {
      createHealthScoreMutation.mutate(data);
    }
  };

  if (scoresLoading || currentLoading) {
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

  const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long' });
  const overallScore = currentScore ? calculateOverallScore(currentScore) : 0;

  return (
    <div className="animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Health Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your holistic well-being across 5 dimensions of health
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white" onClick={handleEdit}>
              {currentScore ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Scores
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scores
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Health Assessment - {monthName} {selectedYear}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {healthDimensions.map((dimension) => {
                    const IconComponent = dimension.icon;
                    return (
                      <FormField
                        key={dimension.id}
                        control={form.control}
                        name={dimension.id as keyof HealthScoreForm}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center space-x-2 text-base">
                              <IconComponent className="w-5 h-5" style={{ color: dimension.color }} />
                              <span>{dimension.name} Health</span>
                            </FormLabel>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {dimension.description}
                            </p>
                            <FormControl>
                              <div className="space-y-3">
                                <Slider
                                  value={[field.value as number]}
                                  onValueChange={(values) => field.onChange(values[0])}
                                  max={10}
                                  min={1}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-500">1 (Poor)</span>
                                  <Badge variant="outline" className="text-base px-3 py-1">
                                    {field.value} - {getScoreLabel(field.value as number)}
                                  </Badge>
                                  <span className="text-sm text-gray-500">10 (Excellent)</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    );
                  })}
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any notes about your health assessment this month..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full gradient-primary text-white">
                  {currentScore ? "Update Health Scores" : "Save Health Scores"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month/Year Selector */}
      <Card className="glass-panel mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xl font-semibold text-gray-900 dark:text-white">
              {monthName} {selectedYear} Assessment
            </h3>
            <div className="flex items-center space-x-4">
              <Select 
                value={selectedMonth.toString()} 
                onValueChange={(value) => setSelectedMonth(Number(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {new Date(0, i).toLocaleDateString('en-US', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Overview */}
      {currentScore ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Health Dimensions */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthDimensions.map((dimension) => {
              const IconComponent = dimension.icon;
              const score = currentScore[dimension.id as keyof HealthScore] as number;
              return (
                <Card key={dimension.id} className="glass-panel card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div 
                        className={`w-10 h-10 ${dimension.gradient} rounded-lg flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-gray-900 dark:text-white">
                          {dimension.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {dimension.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                          {score}/10
                        </span>
                        <Badge variant="outline" className={getScoreColor(score)}>
                          {getScoreLabel(score)}
                        </Badge>
                      </div>
                      <Progress value={score * 10} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Overall Score & Notes */}
          <div className="space-y-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Overall Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                    {overallScore}/10
                  </div>
                  <Badge variant="outline" className={`${getScoreColor(overallScore)} text-base px-4 py-2`}>
                    {getScoreLabel(overallScore)}
                  </Badge>
                  <Progress value={overallScore * 10} className="mt-4 h-3" />
                </div>
              </CardContent>
            </Card>

            {currentScore.notes && (
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {currentScore.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="glass-panel mb-8">
          <CardContent className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
              No assessment for {monthName} {selectedYear}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Add your health scores to start tracking your well-being
            </p>
            <Button className="gradient-primary text-white" onClick={handleEdit}>
              <Plus className="w-4 h-4 mr-2" />
              Add Health Assessment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Health Trends (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[1, 10]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="spiritual" stroke="#7C3AED" strokeWidth={2} />
                  <Line type="monotone" dataKey="mental" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="social" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="physical" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="financial" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          {currentScore && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Current Health Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#7C3AED"
                      fill="#7C3AED"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Health Tips */}
      <Card className="glass-panel mt-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-emerald rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                Holistic Health Approach
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Track your well-being across all dimensions of health. Remember that each dimension affects the others, 
                and balance is key to overall wellness. Rate yourself honestly and use the notes to reflect on your journey.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
