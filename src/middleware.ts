import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Redirect ke login jika belum login dan akses halaman protected
  if (
    !user &&
    (path.startsWith("/account") ||
      path.startsWith("/checkout") ||
      path.startsWith("/admin") ||
      path.startsWith("/seller"))
  ) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Hanya admin yang boleh akses /admin
  if (path.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Hanya approved seller yang boleh akses /seller
  if (path.startsWith("/seller") && user) {
    const { data: seller } = await supabase
      .from("sellers")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    if (seller?.status !== "approved") {
      return NextResponse.redirect(new URL("/sell", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*", "/seller/:path*"],
};