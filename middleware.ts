import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

// Rotas que não exigem autenticação
const publicRoutes = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { user, supabaseResponse } = await updateSession(request);

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Rota raiz: redireciona baseado na autenticação
  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Usuário não autenticado tentando acessar rota protegida
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Usuário autenticado tentando acessar login/signup
  if (user && isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public files (svgs, images)
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.svg$|api).*)",
  ],
};
