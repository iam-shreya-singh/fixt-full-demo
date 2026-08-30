import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (error) {
    console.error('Email send failed', { to, subject, error })
  }
}