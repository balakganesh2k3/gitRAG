import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { GitFork, MessageSquare, Users, Database } from "lucide-react"

const DashboardPage = () => {
  // Mock data for dashboard
  const stats = [
    {
      title: "Total Repositories",
      value: "3",
      description: "Active repositories in RAG",
      icon: GitFork,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      title: "Chatbot Queries",
      value: "1,204",
      description: "Last 30 days",
      icon: MessageSquare,
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      title: "Authorized Users",
      value: "12",
      description: "With chatbot access",
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      title: "Vector Entries",
      value: "8,432",
      description: "In RAG database",
      icon: Database,
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your GitHub repositories and RAG system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-full ${stat.bgColor} p-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in your RAG system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: "Repository Updated",
                  repo: "company/documentation",
                  time: "2 hours ago",
                },
                {
                  action: "New Repository Added",
                  repo: "company/api-docs",
                  time: "1 day ago",
                },
                {
                  action: "Chatbot Configuration Changed",
                  repo: "company/knowledge-base",
                  time: "3 days ago",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    <GitFork className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{item.action}</p>
                    <p className="text-sm text-muted-foreground">{item.repo}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current status of your RAG components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  component: "GitHub Integration",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  component: "Vector Database",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  component: "LLM API",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
                {
                  component: "Chatbot Embedding",
                  status: "Operational",
                  statusColor: "text-green-500",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">{item.component}</span>
                  </div>
                  <span className={`text-sm ${item.statusColor}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage

