# DevLog Dark

개발자 블로그를 위한 무료 티스토리 커스텀 스킨

Free developer-themed Tistory blog skin with dark/light mode

<!-- 스크린샷 추가 예정 -->

## Features

- **Dark / Light mode** toggle (saved in browser)
- **3-column fixed layout** (sidebar / content / sidebar)
- **Developer theme** — terminal prompt `>_`, macOS-style code blocks
- **Auto TOC** — generated from h2/h3 headings
- **Code block Copy button** + macOS window dots (red/yellow/green)
- **Image lightbox** — click to zoom
- **Share buttons** — URL copy, KakaoTalk, X, Facebook, LinkedIn, Naver Blog
- **HOT / NEW badges** — auto-detected from comment count and post date
- **Visitor line graph** — uses Tistory's built-in `window.chartData`
- **SVG cat mouse follower** — cheese cat with eye tracking and walk/sleep animation
- **Keyboard shortcuts** — `/` search, `t` theme toggle
- **Font size controls** — A- / A+ buttons
- **Print-friendly styles**
- **Breadcrumb navigation**
- **Prev/Next post + Related articles**

## Quick Install

### Method 1: ZIP Upload (Recommended)

1. Download `devlog-dark.zip` from this repo
2. Go to **Tistory Admin > Design > Skin > Add Skin**
3. Upload the ZIP file
4. Apply the skin
5. Configure sidebar widgets (see below)

### Method 2: Manual

1. **Admin > Design > Skin Edit > HTML Edit**
2. Paste `skin.html` into HTML tab
3. Paste `style.css` into CSS tab
4. Upload `index.xml` and `images/script.js` via File Upload tab
5. Click Apply

## Sidebar Configuration

After applying, go to **Admin > Design > Sidebar**:

**Left sidebar:**
1. Profile
2. Search
3. Categories
4. Visitor Stats

**Right sidebar:**
1. Calendar
2. Recent Posts
3. Recent Comments

## Customization

### Change accent color

Edit the top of `style.css`:

```css
--accent: #7c3aed;        /* Main purple */
--accent-light: #a78bfa;  /* Light purple */
```

### SNS icons

Add links in **Admin > Design > Sidebar > Links**. The script auto-detects platforms from URLs:

- `linkedin.com` → LinkedIn icon
- `github.com` → GitHub icon
- `instagram.com` → Instagram icon
- `facebook.com` → Facebook icon
- Others → default link icon

### Disable cat follower

Remove the `SVG Cat Character Follower` section from `images/script.js`.

### Privacy policy link

Update the footer in `skin.html`:

```html
<a href="/pages/your-page" class="footer-privacy">Privacy Policy</a>
```

### Add Google Tag Manager

Add your GTM code to `<head>` in `skin.html`:

```html
<head>
  <script>...your GTM code...</script>
```

## File Structure

```
skin.html           # Main HTML template
style.css           # Styles (dark/light mode via CSS variables)
index.xml           # Skin metadata
images/script.js    # All JS functionality
devlog-dark.zip     # Ready-to-upload package
```

## Browser Support

- Chrome, Edge, Safari, Firefox (latest)
- Mobile responsive (horizontal scroll on small screens)

## License

MIT — free for personal and commercial use.
