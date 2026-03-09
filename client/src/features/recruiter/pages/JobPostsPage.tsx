import { useEffect, useMemo, useState } from 'react';
import { Link, useLoaderData, useNavigate, useNavigation, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import { Card } from '@shared/components/Card';
import { RecruiterHeader } from '@features/recruiter/components/RecruiterHeader';
import { getJobStatusAccent } from '@shared/utils/jobStatusAccent';
import { ConfirmationModal } from '@shared/components/ConfirmationModal';
import { HighRiskVerificationModal } from '@shared/components/HighRiskVerificationModal';
import { recruiterService } from '@features/recruiter/service/recruiter.service';
import { useToast } from '@app/providers/ToastProvider';
import type { JobListItem, RecruiterJobsLoaderData } from '@features/recruiter/types';

export const JobPostsPage = () => {
  const loaderData = useLoaderData() as RecruiterJobsLoaderData;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState(loaderData.jobs);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [selectedJob, setSelectedJob] = useState<JobListItem | null>(null);

  useEffect(() => {
    setJobs(loaderData.jobs);
  }, [loaderData.jobs]);

  const pageCount = Math.max(1, loaderData.totalPages ?? Math.ceil(loaderData.total / loaderData.pageSize));
  const currentDepartment = loaderData.filters.department ?? 'all';

  const departments = useMemo(() => {
    const fromList = loaderData.options?.departments ?? [];
    const withCurrent = currentDepartment !== 'all' ? [...fromList, currentDepartment] : fromList;
    return Array.from(new Set(withCurrent.filter(Boolean))).sort();
  }, [currentDepartment, loaderData.options?.departments]);

  useEffect(() => {
    const toast = searchParams.get('toast');
    if (!toast) return;

    if (toast === 'updated') {
      showToast({ title: 'Job updated successfully', description: 'Latest changes are now reflected in your listing.', tone: 'success' });
    }

    const cleaned = new URLSearchParams(searchParams);
    cleaned.delete('toast');
    cleaned.delete('updatedJobId');
    navigate(`/recruiter/job-posts${cleaned.toString() ? `?${cleaned.toString()}` : ''}`, { replace: true });
  }, [navigate, searchParams, showToast]);

  const buildQuery = (next: Record<string, string>) => {
    const merged = { ...Object.fromEntries(searchParams.entries()), ...next };

    Object.keys(merged).forEach((key) => {
      if (!merged[key] || merged[key] === 'all') {
        delete merged[key];
      }
    });

    return new URLSearchParams(merged).toString();
  };

  const openDeleteFlow = (job: JobListItem) => {
    setSelectedJob(job);
    setDeleteError(undefined);
    setIsVerificationOpen(false);
    setIsDeleteOpen(true);
  };

  const closeDeleteFlow = () => {
    if (isDeleting) return;
    setDeleteError(undefined);
    setIsVerificationOpen(false);
    setIsDeleteOpen(false);
  };

  const runDelete = async () => {
    if (!selectedJob || isDeleting) return;

    const previousJobs = jobs;

    try {
      setIsDeleting(true);
      setDeleteError(undefined);
      setJobs((current) => current.filter((job) => job.id !== selectedJob.id));
      await recruiterService.deleteJob(selectedJob.id);
      showToast({ title: 'Job deleted', description: `${selectedJob.title} has been removed.`, tone: 'success' });
      setIsDeleteOpen(false);
      setIsVerificationOpen(false);
      setSelectedJob(null);
      navigate(`/recruiter/job-posts?${buildQuery({ page: String(loaderData.page) })}`, { replace: true });
    } catch {
      setJobs(previousJobs);
      setDeleteError('Unable to delete this job right now. Please try again.');
      showToast({ title: 'Delete failed', description: 'Please try again.', tone: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <RecruiterHeader />
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Job Posts</h2>
        </div>

        <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <input
            name="search"
            defaultValue={loaderData.filters.search}
            onBlur={(event) => {
              const value = event.target.value.trim();
              if (value === loaderData.filters.search) return;
              navigate(`/recruiter/job-posts?${buildQuery({ search: value, page: '1' })}`);
            }}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            placeholder="Search by title or location"
          />
          <select value={currentDepartment} onChange={(event) => navigate(`/recruiter/job-posts?${buildQuery({ department: event.target.value, page: '1' })}`)} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm">
            <option value="all">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-100 text-left">
              <tr>
                {['Title', 'Department', 'Location', 'Type', 'Status', 'Actions'].map((col) => (
                  <th key={col} className="px-4 py-3 font-medium text-zinc-700">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, idx) => {
                const statusAccent = getJobStatusAccent(job.status);

                return (
                  <tr key={job.id} className={idx % 2 ? 'bg-zinc-50' : 'bg-white'}>
                    <td className="px-4 py-3 font-medium">{job.title}</td>
                    <td className="px-4 py-3">{job.department ?? '-'}</td>
                    <td className="px-4 py-3">{job.location}</td>
                    <td className="px-4 py-3">{job.employment_type}</td>
                    <td className="px-4 py-3"><span className={`rounded-lg border px-3 py-1 text-sm font-medium ${statusAccent.className}`}>{statusAccent.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}`}><Eye size={16} /></Link>
                        <Link className="rounded border border-zinc-300 px-2 py-1" to={`/recruiter/job-posts/${job.id}/edit`}><Pencil size={16} /></Link>
                        <button type="button" className="rounded border border-rose-300 px-2 py-1 text-rose-700" onClick={() => openDeleteFlow(job)} disabled={isDeleting}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 p-4 text-sm">
          <span>Page {loaderData.page} of {pageCount}</span>
          <div className="flex items-center gap-2">
            <select value={String(loaderData.pageSize)} className="min-w-30 rounded border border-zinc-300 px-2 py-1 text-sm" onChange={(event) => navigate(`/recruiter/job-posts?${buildQuery({ pageSize: event.target.value, page: '1' })}`)}>
              {[10, 20, 50].map((size) => <option key={size} value={size}>{size} / page</option>)}
            </select>
            <Link to={`/recruiter/job-posts?${buildQuery({ page: String(Math.max(1, loaderData.page - 1)) })}`} className="rounded border border-zinc-300 px-3 py-1">Prev</Link>
            <Link to={`/recruiter/job-posts?${buildQuery({ page: String(Math.min(pageCount, loaderData.page + 1)) })}`} className="rounded border border-zinc-300 px-3 py-1">Next</Link>
          </div>
        </div>
      </Card>

      <ConfirmationModal
        open={isDeleteOpen && !isVerificationOpen}
        title={selectedJob?.status?.toLowerCase() === 'published' ? 'Delete published job?' : 'Delete this job?'}
        message={selectedJob?.status?.toLowerCase() === 'published' ? "This job is published. You'll need one more verification step before it is deleted." : 'This action permanently removes the job post and cannot be undone.'}
        confirmLabel={selectedJob?.status?.toLowerCase() === 'published' ? 'Continue' : 'Delete Job'}
        accent="red"
        loading={isDeleting}
        onClose={closeDeleteFlow}
        onCancel={closeDeleteFlow}
        onConfirm={() => {
          if (selectedJob?.status?.toLowerCase() === 'published') {
            setIsVerificationOpen(true);
            return;
          }

          runDelete();
        }}
      />

      <HighRiskVerificationModal
        open={isDeleteOpen && isVerificationOpen}
        title="Final verification required"
        message="For published job posts, type DELETE or the exact job title to confirm this destructive action."
        expectedKeyword="DELETE"
        expectedText={selectedJob?.title}
        loading={isDeleting || navigation.state === 'loading'}
        error={deleteError}
        onClose={closeDeleteFlow}
        onCancel={closeDeleteFlow}
        onConfirm={runDelete}
      />
    </div>
  );
};
