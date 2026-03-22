import { type NextRequest, NextResponse } from "next/server";
import { readSessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("session")?.value;
    const session = token ? await readSessionToken(token) : null;

    // Protected routes pattern
    const isProtectedRoute =
        request.nextUrl.pathname.startsWith("/dashboard") ||
        request.nextUrl.pathname.startsWith("/pages") ||
        request.nextUrl.pathname.startsWith("/learning") ||
        request.nextUrl.pathname.startsWith("/reminders") ||
        request.nextUrl.pathname.startsWith("/software");

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname === "/" && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (request.nextUrl.pathname === "/login" && session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
