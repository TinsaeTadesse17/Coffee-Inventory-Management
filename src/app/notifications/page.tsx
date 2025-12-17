import { auth } from "@/lib/auth"
import { getUserNotifications } from "@/lib/notification-service"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const notifications = await getUserNotifications(session.user.id, 100)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No notifications found.</p>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-70" : "border-l-4 border-l-blue-500"}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                    <p className="text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {notification.link && (
                    <Link 
                      href={notification.link}
                      className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
