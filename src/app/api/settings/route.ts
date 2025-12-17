
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSettings, updateSettings } from "@/lib/settings"
import { Role } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Admin and CEO can update settings
    if (session.user.role !== Role.ADMIN && session.user.role !== Role.CEO) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const settings = await updateSettings(data)
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
