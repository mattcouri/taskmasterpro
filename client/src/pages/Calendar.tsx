import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, getCurrentDate } from "@/lib/utils";
import type { Meeting } from "@shared/schema";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["/api/meetings", selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/meetings/${selectedDate}`);
      if (!response.ok) throw new Error("Failed to fetch meetings");
      return response.json() as Promise<Meeting[]>;
    },
  });

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
            Calendar
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your appointments and meetings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="glass">
            <ExternalLink className="w-4 h-4 mr-2" />
            Sync Google Calendar
          </Button>
          <Button className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Widget */}
        <div className="lg:col-span-1">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                <span>Calendar</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 glass border border-white/20 dark:border-gray-700/30 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50"
              />
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <div className="lg:col-span-2">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Meetings for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
            </CardHeader>
            <CardContent>
              {meetings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No meetings scheduled</h3>
                  <p className="text-sm">Add a new meeting to get started</p>
                  <Button className="mt-4 gradient-primary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: meeting.color || "#3B82F6" }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {meeting.title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatTime(meeting.startTime)} • {meeting.duration} minutes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">
                          {meeting.duration}m
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Google Calendar Integration Notice */}
      <Card className="glass-panel mt-8">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold text-gray-900 dark:text-white">
                Google Calendar Integration
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect your Google Calendar to automatically sync meetings and appointments. 
                Changes made here will be reflected in your Google Calendar.
              </p>
            </div>
            <Button className="gradient-primary text-white">
              Connect Google Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
