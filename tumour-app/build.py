# Assembles www/index.html from the shared stylesheet (PF app) + src/*
import re,pathlib
root=pathlib.Path(__file__).parent
pf=(root/'../pf-app/www/index.html').read_text()
css=pf[pf.index('<style>')+7:pf.index('</style>')]
head='''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>Bone Tumour Planner</title>
<meta name="description" content="Structured assessment of bone lesions on X-ray and MRI: differential diagnosis, aggressiveness, work-up, referral and Mirels score.">
<meta name="theme-color" content="#05080b">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Bone Tumour">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<style>'''
html=head+css+(root/'src/extra.css').read_text()+'</style>\n</head>\n<body>\n'+(root/'src/body.html').read_text()+'<script>\n'+(root/'src/app.js').read_text()+'</script>\n</body>\n</html>\n'
(root/'www/index.html').write_text(html)
print(len(html))
