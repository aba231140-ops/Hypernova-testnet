
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (body: object, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  try {
    if (req.method !== "POST") {
      return respond({ error: "Méthode non autorisée." }, 405);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return respond({ error: "Authentification requise." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Configuration serveur Supabase manquante.");
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return respond({ error: "Utilisateur non authentifié." }, 401);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: wallet, error: walletError } = await admin
      .from("wallets")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (walletError) throw walletError;

    if (!wallet) {
      return respond({
        error: "Aucun wallet enregistré pour cet utilisateur.",
      }, 403);
    }

    // Récompense unique de première connexion : 10 XP
    const { data: firstData, error: firstError } = await admin.rpc(
      "grant_hypernova_xp",
      {
        p_user_id: user.id,
        p_activity_key: "first_wallet_connection",
        p_points: 10,
        p_idempotency_key: "first_wallet_connection",
        p_description: "Première connexion du wallet",
      }
    );

    if (firstError) throw firstError;

    // Date du jour au Sénégal
    const dateParts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Africa/Dakar",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const dateValues = Object.fromEntries(
      dateParts.map((part) => [part.type, part.value])
    );

    const today = `${dateValues.year}-${dateValues.month}-${dateValues.day}`;

    // Mission quotidienne : 5 XP, une seule fois par jour
    const { data: dailyData, error: dailyError } = await admin.rpc(
      "grant_hypernova_xp",
      {
        p_user_id: user.id,
        p_activity_key: "daily_login",
        p_points: 5,
        p_idempotency_key: `daily_login_${today}`,
        p_description: "Mission quotidienne : connexion du jour",
      }
    );

    if (dailyError) throw dailyError;

    return respond({
      success: true,
      firstConnectionAwarded: firstData !== null,
      dailyAwarded: dailyData !== null,
      firstPoints: firstData !== null ? 10 : 0,
      dailyPoints: dailyData !== null ? 5 : 0,
      message: "Synchronisation XP terminée.",
    });
  } catch (error) {
    console.error("Erreur attribution XP :", error);
    return respond({
      error: error instanceof Error ? error.message : "Erreur serveur.",
    }, 500);
  }
});
                     
