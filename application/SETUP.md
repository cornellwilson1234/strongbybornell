# Strong application: setup

How it works: someone comments or DMs **APPLY** → ManyChat sends them a link to your form → they fill it out on their phone → their answers land in your Google Sheet as a new row, scored Hot, Warm or Cold, and you get an email.

Setup takes about 15 minutes, once.

---

## 1. Make the Google Sheet

1. Go to sheets.google.com and create a blank sheet. Name it **Strong Applications**.
2. In the menu click **Extensions → Apps Script**.
3. Delete what's in the editor. Paste in all of `google-apps-script.gs` from this folder.
4. At the top, put your email in `NOTIFY_EMAIL` (between the quotes). Press **Save**.
5. In the function dropdown next to **Run**, pick `setupSheet` and press **Run**. Google will ask for permission: click **Review permissions**, pick your account, then **Advanced → Go to (project name) → Allow**. That's normal for your own script.
6. Go back to the sheet. You now have an **Applications** tab with headers, status dropdowns and colors.

## 2. Turn the script into a web link

1. In Apps Script, click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**. ("Anyone" only means people can *send* an application. Nobody can read your sheet.)
4. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

## 3. Connect the form

Open `apply.html` and edit the block near the top:

```js
endpoint: "PASTE_YOUR_APPS_SCRIPT_URL_HERE",   // paste the /exec URL here
price: "$___",                                  // e.g. "$199/month"
daysPerWeek: 3,
replyDays: 3
```

Save and publish your site. The form lives at `yoursite.com/apply.html`.

Test it: fill the form out yourself. A row should appear in the sheet within a few seconds, and you should get an email.

## 4. ManyChat: send the link when someone says APPLY

1. In ManyChat go to **Automation → New Automation** (or use the **Keyword** / **Comments** template).
2. Trigger: **User sends a message** containing the keyword **APPLY**. Add a second trigger for **comments** with APPLY on your posts or reels if you want that too.
3. Add a **Send Message** step, for example:

   > You just took the first step. Most people never do.
   > I only take 10 people, so I read every application myself. Takes about 5 minutes:

4. Add a **Button** to that message → **Open website** → paste your form link and add these fields at the end:

   ```
   https://yoursite.com/apply.html?src=manychat&name=FIRST_NAME&ig=IG_USERNAME
   ```

   Replace `FIRST_NAME` and `IG_USERNAME` using ManyChat's **{ } insert field** button (pick *First Name* and *Instagram Username*). That pre-fills their name and handle so you can match the application to the DM.

5. Optional: add a **Tag** step called `applied-link-sent` so you can follow up with people who got the link but didn't apply.
6. Set the automation **Live**.

## Using the tracker

- **Score** is set automatically: **Hot** = said yes to investing, price works, and can commit. **Cold** = said no to investing or the price doesn't work.
- Change **Status** as you go: New → DM sent → Call booked → Accepted / Waitlist / Not a fit.
- Use **Data → Create a filter** to show only Hot leads, or only New ones.
- Keep the sheet private. It holds medical information.

## Changing the questions later

If you add or rename a question in `apply.html`, add a matching line in the `COLUMNS` list in the script, then **Deploy → Manage deployments → Edit → Version: New version → Deploy**. The URL stays the same.
