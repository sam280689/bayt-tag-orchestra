import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  email: string;
  role: string;
  inviterName: string;
  organizationName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, inviterName, organizationName }: InvitationEmailRequest = await req.json();

    console.log('Sending invitation email to:', email);

    const emailResponse = await resend.emails.send({
      from: "Team Invitations <invitations@resend.dev>",
      to: [email],
      subject: `You're invited to join the team${organizationName ? ` at ${organizationName}` : ''}!`,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin-bottom: 10px;">Team Invitation</h1>
            <p style="color: #6b7280; font-size: 16px;">You've been invited to collaborate!</p>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              Hi there! 👋
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
              <strong>${inviterName}</strong> has invited you to join their team${organizationName ? ` at <strong>${organizationName}</strong>` : ''} as a <strong>${role}</strong>.
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
              You'll be able to collaborate on tag management and help organize candidate data effectively.
            </p>
          </div>

          <div style="background-color: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 30px;">
            <h3 style="color: #1e40af; margin: 0 0 8px 0; font-size: 16px;">Your Role: ${role.charAt(0).toUpperCase() + role.slice(1)}</h3>
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              ${role === 'admin' ? 'Full access to all features including team management' : 
                role === 'editor' ? 'Can create, edit tags and manage candidate data' : 
                'Can view and use existing tags'}
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${Deno.env.get('SITE_URL') || 'https://your-app.com'}/auth" 
               style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Accept Invitation & Sign Up
            </a>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin: 0 0 16px 0;">
              ${Deno.env.get('SITE_URL') || 'https://your-app.com'}/auth
            </p>
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              If you're not interested in this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);