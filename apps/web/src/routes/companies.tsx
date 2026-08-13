import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '#/integrations/trpc/react'

export const Route = createFileRoute('/companies')({
  // Prefetch on the server; the component then reads from cache.
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(context.trpc.companies.list.queryOptions()),
  component: CompaniesPage,
})

function CompaniesPage() {
  const trpc = useTRPC()
  const { data, isPending, error } = useQuery(trpc.companies.list.queryOptions())

  if (isPending) return <p className="p-8">Loading companies…</p>

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Failed to load companies</h1>
        <pre className="mt-4 text-sm whitespace-pre-wrap">{error.message}</pre>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Companies</h1>

      {data.length === 0 ? (
        <p className="mt-4">
          No companies yet — run <code>pnpm --filter @repo/db db:seed</code>.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {data.map((company) => (
            <li key={company.id} className="rounded border p-3">
              <div className="font-medium">{company.name}</div>
              <div className="text-sm opacity-70">{company.domain}</div>
              {/* A Date, not a string, because superjson runs on both ends. */}
              <div className="text-xs opacity-50">
                {company.createdAt.toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
