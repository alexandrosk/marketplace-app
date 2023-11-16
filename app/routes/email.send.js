import { json } from "@remix-run/node";
import { Resend } from "resend";
import { getSetting } from "~/models/settings.server";

export const loader = async (params) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, from, to, subject, html, session } = params;

    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["alexandroskoukis@gmail.com"],
      subject: "Hello world",
      html: "<strong>It works!</strong>",
    });

    return json(data, 200);
  } catch (error) {
    return json({ error }, 400);
  }
};
