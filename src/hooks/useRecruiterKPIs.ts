import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, format } from 'date-fns';

export interface RecruiterKPI {
  recruiterId: string;
  recruiterName: string;
  openPositions: number;
  jobCoverageRatio: number;
  amSubmissions: number;
  endClientSubmissions: number;
  interviews: number;
  hired: number;
}

export interface RecruiterKPISummary {
  totalOpenPositions: number;
  avgJobCoverageRatio: number;
  totalAMSubmissions: number;
  totalEndClientSubmissions: number;
  totalInterviews: number;
  totalHired: number;
}

export function useRecruiterKPIs(weekDate?: Date) {
  const date = weekDate || new Date();
  const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const weekEnd = format(endOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['recruiter_kpis', weekStart, weekEnd],
    queryFn: async () => {
      // Get all recruiters
      const { data: recruiters, error: recruitersError } = await supabase
        .from('employees')
        .select('id, name')
        .eq('role', 'Recruiter')
        .eq('is_active', true);
      
      if (recruitersError) throw recruitersError;

      // Get job assignments for each recruiter (open positions worked on)
      const { data: jobAssignments, error: jobsError } = await supabase
        .from('job_recruiters')
        .select(`
          employee_id,
          job:jobs(id, status)
        `);
      
      if (jobsError) throw jobsError;

      // Get recruiter activities for the week
      const { data: activities, error: activitiesError } = await supabase
        .from('recruiter_activities')
        .select('*')
        .gte('activity_date', weekStart)
        .lte('activity_date', weekEnd);
      
      if (activitiesError) throw activitiesError;

      // Calculate KPIs per recruiter
      const recruiterKPIs: RecruiterKPI[] = (recruiters || []).map(r => {
        // Open positions - count unique jobs assigned to this recruiter
        const assignedJobs = (jobAssignments || []).filter(ja => ja.employee_id === r.id);
        const openPositions = assignedJobs.length;

        // Job coverage - jobs with any submissions / total jobs
        const recruiterActivities = (activities || []).filter(a => a.employee_id === r.id);
        const jobsWithActivity = new Set(recruiterActivities.map(a => a.job_id)).size;
        const jobCoverageRatio = openPositions > 0 ? (jobsWithActivity / openPositions) * 100 : 0;

        // Sum up activity metrics for the week
        const amSubmissions = recruiterActivities.reduce((sum, a) => sum + (a.am_submissions || 0), 0);
        const endClientSubmissions = recruiterActivities.reduce((sum, a) => sum + (a.end_client_submissions || 0), 0);
        const interviews = recruiterActivities.reduce((sum, a) => sum + (a.interviews_scheduled || 0), 0);
        const hired = recruiterActivities.reduce((sum, a) => sum + (a.hired || 0), 0);

        return {
          recruiterId: r.id,
          recruiterName: r.name,
          openPositions,
          jobCoverageRatio: Math.round(jobCoverageRatio),
          amSubmissions,
          endClientSubmissions,
          interviews,
          hired,
        };
      });

      // Calculate summary
      const summary: RecruiterKPISummary = {
        totalOpenPositions: recruiterKPIs.reduce((sum, r) => sum + r.openPositions, 0),
        avgJobCoverageRatio: recruiterKPIs.length > 0
          ? Math.round(recruiterKPIs.reduce((sum, r) => sum + r.jobCoverageRatio, 0) / recruiterKPIs.length)
          : 0,
        totalAMSubmissions: recruiterKPIs.reduce((sum, r) => sum + r.amSubmissions, 0),
        totalEndClientSubmissions: recruiterKPIs.reduce((sum, r) => sum + r.endClientSubmissions, 0),
        totalInterviews: recruiterKPIs.reduce((sum, r) => sum + r.interviews, 0),
        totalHired: recruiterKPIs.reduce((sum, r) => sum + r.hired, 0),
      };

      return { recruiters: recruiterKPIs, summary };
    },
  });
}
