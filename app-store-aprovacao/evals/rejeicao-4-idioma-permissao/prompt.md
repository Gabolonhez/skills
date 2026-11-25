---
tags: [skill-creator]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

rejeição na guideline 4 - Design: "the permission request alert for camera access is displayed in a different language than the app's language". meu app é expo, interface em pt-BR e inglês, e eu já tenho locales/pt-BR.json com os textos de permissão. a pasta ios/ tá commitada no git. no Info.plist o NSCameraUsageDescription tá "Precisamos acessar sua câmera para fotografar a refeição." e o CFBundleDevelopmentRegion é en. como resolvo?
