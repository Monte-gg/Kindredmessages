# Connect Kindred to Supabase

The website now uses Supabase Auth for accounts and password recovery. The
publishable key in `supabase-config.js` is intended for browsers; never put a
service-role key, database password, or email-provider secret in that file.
Existing demo accounts are not imported. Messages and attachments are still
stored in each browser and are not imported into the shared chat history.

## Use accounts without signup confirmation emails

To let people create an account and sign in immediately without sending a
confirmation email, open the Supabase project and go to **Authentication →
Providers (or Sign In / Providers) → Email**. Turn off **Confirm email** and
save the setting. The Kindred signup flow signs the user in immediately when
Supabase returns a session. If it still requests confirmation, refresh the
page and check this setting in the same project shown in `supabase-config.js`.

This removes the signup confirmation email and its sending limit from the
signup flow. Use email addresses users can access: password recovery still
sends an email, so recovery messages remain subject to your Supabase email
provider's limits. Without confirmation, people can register an address they
do not own; usernames and addresses remain unique, but the address owner is not
verified.

## 1. Create the tables and policies

In the Supabase project, open **SQL Editor**, create a query, paste the contents
of `supabase/schema.sql`, and run it.

If sign-in reports `Could not find the table 'public.profiles' in the schema
cache`, this setup SQL has not been run in the same Supabase project as the
website, or the API schema cache has not refreshed. Run the full SQL file above
in that project's SQL Editor; it creates `profiles` and refreshes the API
schema cache. Confirm the project reference is `cpobteauoiptthjihhfl` before
running it. Then reload the website and sign in again.

If sign-in reports `column profiles.avatar_path does not exist`, the profile
picture migration is missing. Run the entire current `supabase/schema.sql` in
the same project's SQL Editor, then reload the website; the saved session
should restore after the migration.

If the table exists but sign-in says `Cannot coerce the result to a single JSON
object`, the account may have been created before the profile table/trigger was
installed. Run the updated full `supabase/schema.sql` again. It safely creates
profiles for existing accounts as well as installing the signup trigger. Then
reload the site and sign in again.

The same SQL file also enables the member directory, username/email search,
friend requests, private direct conversations, realtime text messages, read
receipts, typing indicators, audio-call signaling, member bios, and private
file attachments. Email search requires the exact email address; the
matching member's email is never shown to other users. Re-run the full updated
SQL in the Supabase SQL Editor to install these features.
The latest schema also allows you to delete your own messages and attachments
from a conversation; run the full schema again to enable the required
permission. Use the **Delete** action beside one of your messages; its text and
attachment are removed for both people in that conversation. Messages from
other people cannot be deleted from your account. After running the SQL, also
publish the latest `app.js`, `styles.css`, `index.html`, and
`service-worker.js`; the SQL change alone cannot add the Delete button to the
website.
The updated schema also enables username editing from the account menu; the
account email is displayed in Profile but is not editable there. Profile
pictures are stored in the public `kindred-profile-pictures` bucket so member
avatars can appear across devices. Only the signed-in owner can upload or
remove pictures under their own user ID folder.
Members can add a bio of up to 280 characters in Profile; it is visible to
signed-in members. Open a member profile from the People list or a conversation
header. The latest schema adds replies, forwards, reactions, personal pinned
and starred message markers, and recent-call history. It also allows removal of
your profile picture. Re-run the complete schema to enable these features; it
preserves conversation messages and call records.

Audio calls use browser microphone permission, Supabase Realtime for private
call signaling, and a peer-to-peer WebRTC audio connection. Both people need to
be online in Kindred and allow microphone access; calls require HTTPS. Networks
that block direct peer-to-peer traffic need a TURN relay. Devices on the same
Wi-Fi network can normally connect directly without TURN, provided the local
network and browser allow WebRTC traffic. Kindred requests short-lived TURN
credentials through the authenticated `kindred-turn-credentials` Supabase
Edge Function; the permanent relay secret is never sent to the website.

### Set up a self-hosted TURN relay

For callers mainly in East Africa, choose a VPS region with good connectivity
to East Africa; Johannesburg is a practical nearby option. Start with an
Ubuntu 24.04 server with a public IPv4 address, at least 1 GB RAM, and enough
network transfer for audio calls. Relayed audio uses bandwidth in both
directions, so check the provider's transfer limits and charges. Creating the
VPS may require a paid account and payment details.

1. Create an Ubuntu 24.04 VPS in Johannesburg with a public IPv4 address.
   A provider such as Vultr offers this region; compare its current server and
   data-transfer prices before creating the VPS. Point a DNS hostname such as
   `turn.example.com` at the VPS IP. Replace `example.com` with a domain you
   control.
2. In the provider firewall, allow UDP and TCP `3478`, TCP `443`, and UDP
   `49160-49259`. Keep TCP `443` free on this VPS for TURN-over-TLS.
3. Connect to the server over SSH and install Coturn and Certbot:

   ```sh
   sudo apt update
   sudo apt install -y coturn certbot
   sudo certbot certonly --standalone -d turn.example.com
   ```

   Replace the hostname with your real DNS name. Certbot needs inbound TCP
   `80` for validation; allow it temporarily in the provider firewall and
   Ubuntu firewall, then keep it open for automatic certificate renewal.
4. Allow the TURN and relay ports in Ubuntu's firewall. If UFW is enabled,
   allow SSH before enabling it so you do not lock yourself out:

   ```sh
   sudo ufw allow OpenSSH
   sudo ufw allow 3478/udp
   sudo ufw allow 3478/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 49160:49259/udp
   sudo ufw enable
   ```

5. Copy `infra/coturn/turnserver.conf.example` to `/etc/turnserver.conf`.
   Replace `turn.example.com` and the certificate paths with your hostname.
   Generate a strong secret with `openssl rand -hex 32`; set it as Coturn's
   `static-auth-secret` and keep a private copy for Supabase. Do not commit it
   or send it in chat. Edit `/etc/default/coturn` and set
   `TURNSERVER_ENABLED=1`, then run `sudo systemctl enable --now coturn`.
6. In the Supabase dashboard for project `cpobteauoiptthjihhfl`, open
   **Project Settings > Edge Functions > Secrets** and add:
   - `TURN_HOST` — the hostname only, such as `turn.example.com`.
   - `TURN_SHARED_SECRET` — the same random value as Coturn's
     `static-auth-secret`.
7. Deploy `supabase/functions/kindred-turn-credentials` to that Supabase
   project using the Supabase CLI:

   ```text
   supabase functions deploy kindred-turn-credentials --project-ref cpobteauoiptthjihhfl
   ```

   Leave JWT verification enabled. The function verifies each signed-in user
   and generates one-day Coturn credentials using the shared secret.
8. Publish the updated website and test a call with one person on Wi-Fi and
   another on mobile data. If the function responds with
   `Requested function was not found`, it has not been deployed. A `503` means
   one or both TURN secrets are missing.

TURN improves call reachability but cannot guarantee a call through every
firewall, provider, or device. Monitor bandwidth usage and the VPS provider's
network transfer charges.

## Install Kindred like an app

Kindred includes a web app manifest and service worker. To install it, first
publish the site over HTTPS; opening `index.html` directly from your computer
does not support app installation. This repository deploys to GitHub Pages
automatically when changes are pushed to `main`. To enable it, open the
repository's **Settings > Pages**, set **Build and deployment > Source** to
**GitHub Actions**, then wait for the Pages deployment in the **Actions** tab
to finish. The site address is
<https://monte-gg.github.io/Kindredmessages/>.

In the Supabase dashboard, open **Authentication > URL Configuration** and add
`https://monte-gg.github.io/Kindredmessages/` to the allowed redirect URLs so
password recovery can return to the app. Keep `supabase-config.js` with the
site; it contains the browser-safe publishable key, never a service-role
secret.

On desktop Chrome or Edge, choose **Install Kindred** when the button appears,
or use the browser's install option. On iPhone or iPad, open the HTTPS address
in Safari, tap **Share**, then **Add to Home Screen**. Messaging, sign-in, and
file sharing still need an internet connection.
Use **Refresh app** on the sign-in screen, or **Check for updates** in your
account menu, to install the latest published version when one is available.
When a newer version is found automatically, choose **Refresh now** to apply it
or **Later** to keep using the current version until you're ready.

## Message and call notifications

After signing in, open the account menu and choose **Enable message & call
alerts**. Incoming messages use the device's normal notification appearance,
without revealing message text, and incoming calls ring in Kindred and show a
notification when permission is granted. Selecting a call notification opens
Kindred so you can answer.
Incoming call sound depends on browser audio permissions and the device's
notification and sound settings.

On desktop Chrome or Edge, use **Install Kindred** when available to install
the site as an app. On mobile, install it from the browser's app/home-screen
menu. The operating system may show allowed notifications over other apps, but
a website cannot force itself on top of other apps or control notification
styling. Browser notifications do not provide a portable text-entry field
inside the system popup.

Notifications depend on Kindred's live Supabase connection and cannot wake the
app after the browser/app has been fully closed or its connection has stopped.
That requires a separate Web Push sender and VAPID setup, which is not
configured in this project. The operating system controls notification
styling, sound, vibration, and lock-screen previews.

## Configure recovery codes by email

In **Authentication → Email Templates → Reset Password**, use the one-time
token variable `{{ .Token }}` in the message, for example:

```text
Your Kindred password reset code is: {{ .Token }}

This code expires soon. If you did not request it, ignore this email.
```

The recovery screen verifies that token with Supabase before allowing a new
password. Configure an email provider under **Project Settings → Auth → SMTP
Settings** before inviting other people; the default email sender is
rate-limited and intended only for testing.

## Find members and chat

After running the updated schema, sign in and choose **People** in the
left-hand sidebar. New members see recently joined suggestions, can search by
username or exact email, and can send or respond to friend requests. Email
addresses are never displayed, but someone who already knows an exact address
can use it to find that member's username. Online/offline labels use active
signed-in sessions and update through Supabase Realtime; they are not stored as
permanent activity. Selecting **Message** opens a shared
conversation. Text messages and up to 25 MB per-file attachments are stored in
Supabase and update live for both participants. The SQL creates a private
`kindred-chat-files` Storage bucket with membership-restricted access. If
Storage or Realtime is disabled for the project, enable them in the Supabase
dashboard. Sent messages show **Not read** until the other member opens the
conversation, then show **Read**. A short typing indicator appears while the
other member is composing. These features require Realtime access to the
`conversation_members` table, which the latest schema configures.

Members who have not created a Kindred account will not appear in the list.
Legacy local-only chats and files remain in that browser and are not migrated.

For local testing, run the site from its folder in PowerShell:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Then open `http://localhost:8000/index.html` (not `index.html` directly as a
`file://` URL). In Supabase **Authentication → URL Configuration**, set the
**Site URL** to `http://localhost:8000` for local testing and add
`http://localhost:8000/**` under **Redirect URLs**. The app sends verification
and password-recovery emails back to the page's web address; when opened as a
`file://` URL it uses the localhost address above. Keep the local server
running when you click the email link. For a public deployment, replace the
Site URL with your real HTTPS website address and add its origin/pattern to
Redirect URLs as well.

If you already clicked a confirmation link that goes to an unreachable
address, it was generated using the old redirect settings. Fix the URL
configuration and create/resend a confirmation email; the old link will still
point at the old address.
