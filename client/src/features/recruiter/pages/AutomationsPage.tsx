import { Form, useLoaderData } from "react-router-dom";
import { Card } from "@shared/components/Card";

const variables = ["{{candidateName}}", "{{jobTitle}}", "{{interviewDate}}"];

export const AutomationsPage = () => {
  const { rules, auditLog, outbox, jobs } = useLoaderData() as {
    rules: Array<{
      id: string;
      name: string;
      trigger: string;
      enabled: boolean;
      lastRunAt?: string;
      subject: string;
      body: string;
    }>;
    auditLog: Array<{
      id: string;
      at: string;
      ruleName: string;
      message: string;
      outcome: string;
    }>;
    outbox: Array<{ id: string; to: string; subject: string; sentAt: string }>;
    jobs: Array<{ id: string; title: string }>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="mb-3 text-xl font-semibold">Automation Rules</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {[
                "Name",
                "Trigger",
                "Template",
                "Enabled",
                "Last run",
                "Actions",
              ].map((col) => (
                <th key={col} className="px-3 py-2 text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-3 py-2">{rule.name}</td>
                <td className="px-3 py-2">{rule.trigger}</td>
                <td className="px-3 py-2">{rule.subject}</td>
                <td className="px-3 py-2">{rule.enabled ? "On" : "Off"}</td>
                <td className="px-3 py-2">
                  {rule.lastRunAt
                    ? new Date(rule.lastRunAt).toLocaleString()
                    : "-"}
                </td>
                <td className="px-3 py-2">
                  <Form
                    method="post"
                    action={`/recruiter/automations/${rule.id}`}
                    className="inline"
                  >
                    <input type="hidden" name="intent" value="toggle" />
                    <input
                      type="hidden"
                      name="enabled"
                      value={String(!rule.enabled)}
                    />
                    <button className="mr-2 underline" type="submit">
                      Toggle
                    </button>
                  </Form>
                  <Form
                    method="post"
                    action={`/recruiter/automations/${rule.id}`}
                    className="inline"
                  >
                    <input type="hidden" name="intent" value="delete" />
                    <button className="underline" type="submit">
                      Delete
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="mb-3 text-lg font-semibold">Rule Editor</h3>
        <Form
          method="post"
          action="/recruiter/automations"
          className="grid gap-3 md:grid-cols-2"
        >
          <input
            aria-label="rule name"
            name="name"
            placeholder="Rule name"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            required
          />
          <select
            aria-label="trigger"
            name="trigger"
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            {[
              "candidate.stage_changed",
              "interview.scheduled",
              "interview.rescheduled",
              "offer.sent",
            ].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select
            aria-label="job condition"
            name="jobId"
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <input
            aria-label="from stage"
            name="fromStage"
            placeholder="From stage optional"
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
          <input
            aria-label="to stage"
            name="toStage"
            placeholder="To stage optional"
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
          <input
            aria-label="subject"
            name="subject"
            placeholder="Email subject"
            className="rounded-lg border border-zinc-300 px-3 py-2 md:col-span-2"
            required
          />
          <textarea
            aria-label="body"
            name="body"
            placeholder="Email body"
            rows={5}
            className="rounded-lg border border-zinc-300 px-3 py-2 md:col-span-2"
            required
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" name="enabled" defaultChecked /> Enabled
          </label>
          <div className="text-xs text-zinc-500">
            Variables: {variables.join(" ")}
          </div>
          <button
            className="rounded-lg bg-zinc-900 px-4 py-2 text-white md:col-span-2"
            type="submit"
          >
            Save automation
          </button>
        </Form>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Audit log</h3>
            <Form method="post" action="/recruiter/automations/run-offer">
              <input type="hidden" name="candidateId" value="cand-1" />
              <input type="hidden" name="jobId" value="job-1" />
              <button
                className="rounded border border-zinc-300 px-2 py-1 text-xs"
                type="submit"
              >
                Mock offer trigger
              </button>
            </Form>
          </div>
          <ul className="space-y-2 text-sm">
            {auditLog.map((log) => (
              <li key={log.id} className="rounded border border-zinc-200 p-2">
                {log.ruleName} · {log.outcome}
                <p className="text-xs text-zinc-500">
                  {log.message} — {new Date(log.at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold">Outbox</h3>
          <ul className="space-y-2 text-sm">
            {outbox.map((mail) => (
              <li key={mail.id} className="rounded border border-zinc-200 p-2">
                <p className="font-medium">{mail.subject}</p>
                <p>To: {mail.to}</p>
                <p className="text-xs text-zinc-500">
                  {new Date(mail.sentAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};
