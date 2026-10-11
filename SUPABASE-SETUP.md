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
header. Audio calls use browser microphone permission, Supabase Realtime for
private call signaling, and a peer-to-peer WebRTC audio connection. Both people
need to be online in Kindred and allow microphone access; calls require HTTPS
and may not connect on networks that block direct peer-to-peer traffic.

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

## Message notifications

After signing in, open the account menu and choose **Enable notifications**.
Incoming messages then use the device's normal notification appearance while
Kindred is open in a browser tab or installed app. The notification can open
that conversation; its **Reply** action opens Kindred with the reply box ready.
Browser notifications do not provide a portable text-entry field inside the
system popup.

This version listens for messages over the live Supabase connection, so it
cannot wake Kindred after the browser/app has been fully closed or its
connection has stopped. Notifications in that state require a separate Web
Push sender and VAPID setup; the app does not claim to provide closed-app push
yet. The operating system controls notification styling, and its notification
settings control lock-screen previews.

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
