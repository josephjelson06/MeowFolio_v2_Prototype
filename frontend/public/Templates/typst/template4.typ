// ═══════════════════════════════════════════════════════════════════════════════
// MeowFolio — Template 4: Minimal
// ═══════════════════════════════════════════════════════════════════════════════
// Reads resume data from a JSON string variable injected at compile time.
// Left-aligned, low-chrome, elegant layout with strong vertical breathing room.
// ═══════════════════════════════════════════════════════════════════════════════

// Data is injected by the renderer as a stringified JSON variable
#let data = json(bytes(sys.inputs.at("resume-data", default: "{}")))
#let opts = json(bytes(sys.inputs.at("render-options", default: "{}")))

// ── Config ────────────────────────────────────────────────────────────────────
#let typography = opts.at("typography", default: (:))
#let spacing = opts.at("spacing", default: (:))
#let colors = opts.at("colors", default: (:))

#let highlight-color = rgb(
  opts.at("accentColorR", default: 50),
  opts.at("accentColorG", default: 50),
  opts.at("accentColorB", default: 50),
)
#let body-font = typography.at("fontFamily", default: opts.at("fontFamily", default: "Palatino"))
#let body-size = eval(str(typography.at("baseFontSize", default: opts.at("fontSize", default: 10))) + "pt")
#let line-height = eval(str(typography.at("lineHeight", default: opts.at("lineSpacing", default: 1.2))) + "em")

#let page-margin = eval(str(spacing.at("margin", default: opts.at("margin", default: "0.6in"))))
#let section-gap-val = spacing.at("sectionGap", default: 14)
#let entry-gap-val = spacing.at("entryGap", default: 8)

#let section-gap = eval(str(section-gap-val) + "pt")
#let entry-gap = eval(str(entry-gap-val) + "pt")

// ── Page setup ────────────────────────────────────────────────────────────────
#set page(paper: "us-letter", margin: (x: page-margin, y: page-margin))
#set text(font: body-font, size: body-size)
#set par(justify: false, leading: line-height - 1em)

// ── Helper: safe field access ─────────────────────────────────────────────────
#let field(obj, key, fallback: "") = {
  if obj == none { return fallback }
  let v = obj.at(key, default: none)
  if v == none { fallback } else { str(v) }
}

// ── Header ────────────────────────────────────────────────────────────────────
#let header-data = data.at("header", default: none)
#if header-data != none {
  let name = field(header-data, "name")
  let role = field(header-data, "role")
  
  if name != "" {
    text(size: 26pt, weight: "regular", name)
  }
  if role != "" {
    linebreak()
    v(0.1em)
    text(size: 11pt, weight: "medium", tracking: 0.1em, fill: highlight-color, upper(role))
  }
  
  v(0.4em)
  
  // Inline contact items
  let contacts = ()
  let email = field(header-data, "email")
  let phone = field(header-data, "phone")
  let address = field(header-data, "address")
  let gh = header-data.at("github", default: none)
  let li = header-data.at("linkedin", default: none)
  let ws = header-data.at("website", default: none)
  
  if email != "" { contacts.push(link("mailto:" + email, email)) }
  if phone != "" { contacts.push(phone) }
  if address != "" { contacts.push(address) }
  if gh != none and field(gh, "url") != "" {
    let url = field(gh, "url")
    let display = field(gh, "displayText", fallback: url)
    contacts.push(link(url, display))
  }
  if li != none and field(li, "url") != "" {
    let url = field(li, "url")
    let display = field(li, "displayText", fallback: url)
    contacts.push(link(url, display))
  }
  if ws != none and field(ws, "url") != "" {
    let url = field(ws, "url")
    let display = field(ws, "displayText", fallback: url)
    contacts.push(link(url, display))
  }
  
  text(size: 8.5pt, fill: rgb(110, 110, 110), contacts.join("   ·   "))
  v(0.8em)
}

// ── Section heading ───────────────────────────────────────────────────────────
#let section-heading(title) = {
  v(section-gap)
  block(width: 100%, breakable: false, {
    // Low-chrome styling: no horizontal rule line, just elegant bold tracking
    text(fill: highlight-color, weight: "bold", size: 11pt, tracking: 0.05em, upper(title))
    v(0.3em)
  })
}

// ── Date formatter ────────────────────────────────────────────────────────────
#let format-date(date-obj) = {
  if date-obj == none { return "" }
  let start-month = field(date-obj, "startMonth")
  let start-year = field(date-obj, "startYear")
  let end-month = field(date-obj, "endMonth")
  let end-year = field(date-obj, "endYear")
  let is-ongoing = date-obj.at("isOngoing", default: false)

  let start = if start-month != "" and start-year != "" {
    start-month + " " + start-year
  } else if start-year != "" {
    start-year
  } else { "" }

  let end = if is-ongoing == true { "Present" }
  else if end-month != "" and end-year != "" { end-month + " " + end-year }
  else if end-year != "" { end-year }
  else { "" }

  if start != "" and end != "" { start + " – " + end }
  else if start != "" { start }
  else if end != "" { end }
  else { "" }
}

// ── Experience/Project entry header ───────────────────────────────────────────
#let entry-header(title, subtitle, location, date-str) = {
  block(breakable: false, {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      {
        text(weight: "bold", size: body-size, title)
        if subtitle != "" {
          text("  ·  ", weight: "regular", fill: rgb(150, 150, 150))
          text(style: "normal", weight: "regular", subtitle)
        }
      },
      text(size: body-size, style: "italic", date-str),
    )
    if location != "" {
      v(-0.25em)
      text(size: 8.5pt, style: "normal", fill: rgb(120, 120, 120), location)
      v(0.1em)
    }
  })
}

// ── Bullet list ───────────────────────────────────────────────────────────────
#let bullet-list(items) = {
  let filtered = items.filter(b => b != none and str(b).trim() != "")
  if filtered.len() > 0 {
    set list(marker: ([–],), body-indent: 0.5em)
    for item in filtered {
      [- #text(size: body-size, str(item))]
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── Summary / Objective ───────────────────────────────────────────────────────
#let render-summary() = {
  let summary = data.at("summary", default: none)
  if summary == none { return }
  let content-text = field(summary, "content")
  if content-text == "" { return }
  let mode = field(summary, "mode", fallback: "professional-summary")
  let title = if mode == "career-objective" { "Objective" } else { "Summary" }
  section-heading(title)
  text(size: body-size, content-text)
  v(0.2em)
}

// ── Education ─────────────────────────────────────────────────────────────────
#let render-education() = {
  let items = data.at("education", default: ())
  if items.len() == 0 { return }
  section-heading("Education")
  for entry in items {
    let degree = field(entry, "degree")
    let fld = field(entry, "field")
    let title = if degree != "" and fld != "" { degree + " in " + fld }
    else if degree != "" { degree }
    else { fld }
    let inst = field(entry, "institution")
    let loc = field(entry, "location")
    let date = format-date(entry.at("date", default: none))
    let result = field(entry, "result")

    entry-header(if inst != "" { inst } else { title }, if inst != "" { title } else { "" }, loc, date)
    if result != "" {
      text(size: 8.5pt, style: "italic", "Result: " + result)
      linebreak()
    }
    v(entry-gap)
  }
}

// ── Skills ────────────────────────────────────────────────────────────────────
#let render-skills() = {
  let skills = data.at("skills", default: none)
  if skills == none { return }
  let mode = field(skills, "mode", fallback: "csv")
  let items = skills.at("items", default: ())
  let groups = skills.at("groups", default: ())

  if mode == "grouped" and groups.len() > 0 {
    section-heading("Skills")
    for group in groups {
      let label = field(group, "groupLabel")
      let group-items = group.at("items", default: ())
      if group-items.len() > 0 {
        text(weight: "bold", size: body-size, label + ": ")
        text(size: body-size, group-items.join(", "))
        linebreak()
      }
    }
    v(entry-gap)
  } else if items.len() > 0 {
    section-heading("Skills")
    text(size: body-size, items.join(", "))
    v(entry-gap)
  }
}

// ── Experience ────────────────────────────────────────────────────────────────
#let render-experience() = {
  let items = data.at("experience", default: ())
  if items.len() == 0 { return }
  section-heading("Experience")
  for entry in items {
    let role = field(entry, "role")
    let company = field(entry, "company")
    let loc = field(entry, "location")
    let date = format-date(entry.at("date", default: none))
    let desc = entry.at("description", default: none)

    entry-header(role, company, loc, date)
    if desc != none {
      if type(desc) == str {
        text(size: body-size, desc)
      } else if type(desc) == dictionary {
        let bullets = desc.at("bullets", default: ())
        let para = field(desc, "paragraph")
        if type(bullets) == array and bullets.len() > 0 {
          bullet-list(bullets)
        } else if para != "" {
          text(size: body-size, para)
        }
      }
    }
    v(entry-gap)
  }
}

// ── Projects ──────────────────────────────────────────────────────────────────
#let render-projects() = {
  let items = data.at("projects", default: ())
  if items.len() == 0 { return }
  section-heading("Projects")
  for entry in items {
    let title = field(entry, "title")
    let techs = entry.at("technologies", default: ())
    let tech-str = if techs.len() > 0 { techs.join(", ") } else { "" }
    let date = format-date(entry.at("date", default: none))
    let desc = entry.at("description", default: none)

    entry-header(title, tech-str, "", date)
    if desc != none {
      if type(desc) == str {
        text(size: body-size, desc)
      } else if type(desc) == dictionary {
        let bullets = desc.at("bullets", default: ())
        let para = field(desc, "paragraph")
        if type(bullets) == array and bullets.len() > 0 {
          bullet-list(bullets)
        } else if para != "" {
          text(size: body-size, para)
        }
      }
    }
    v(entry-gap)
  }
}

// ── Certifications ────────────────────────────────────────────────────────────
#let render-certifications() = {
  let items = data.at("certifications", default: ())
  if items.len() == 0 { return }
  section-heading("Certifications")
  for entry in items {
    let title = field(entry, "title")
    let issuer = field(entry, "issuer")
    let date = format-date(entry.at("date", default: none))
    let desc = field(entry, "description")

    entry-header(title, issuer, "", date)
    if desc != "" {
      text(size: body-size, desc)
      linebreak()
    }
    v(entry-gap)
  }
}

// ── Custom/Generic sections ───────────────────────────────────────────────────
#let render-custom-section(section) = {
  if section == none { return }
  if type(section) != dictionary { return }
  let label = field(section, "label")
  let entries = section.at("entries", default: ())
  if entries.len() == 0 { return }

  section-heading(label)
  for entry in entries {
    if type(entry) != dictionary { continue }
    let title = field(entry, "title")
    let subtitle = field(entry, "subtitle")
    let loc = field(entry, "location")
    let date = format-date(entry.at("date", default: none))
    let desc = entry.at("description", default: none)

    entry-header(title, subtitle, loc, date)
    if desc != none {
      if type(desc) == str {
        text(size: body-size, desc)
      } else if type(desc) == dictionary {
        let bullets = desc.at("bullets", default: ())
        let para = field(desc, "paragraph")
        if type(bullets) == array and bullets.len() > 0 {
          bullet-list(bullets)
        } else if para != "" {
          text(size: body-size, para)
        }
      }
    }
    v(entry-gap)
  }
}

// ── Languages ─────────────────────────────────────────────────────────────────
#let render-languages() = {
  let langs = data.at("languages", default: none)
  if langs == none { return }
  let items = langs.at("items", default: ())
  if items.len() == 0 { return }

  section-heading("Languages")
  let parts = items.map(l => {
    let lang = field(l, "language")
    let prof = field(l, "proficiency")
    if lang != "" and prof != "" { lang + " (" + prof + ")" }
    else { lang }
  }).filter(s => s != "")
  text(size: body-size, parts.join(", "))
  v(0.2em)
}

// ── Hobbies ───────────────────────────────────────────────────────────────────
#let render-hobbies() = {
  let hobbies = data.at("hobbies", default: none)
  if hobbies == none { return }
  let items = hobbies.at("items", default: ())
  if items.len() == 0 { return }

  section-heading("Hobbies & Interests")
  text(size: body-size, items.join(", "))
  v(0.2em)
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENDER DISPATCH (respects sectionOrder from renderOptions)
// ═══════════════════════════════════════════════════════════════════════════════

#let section-order = opts.at("sectionOrder", default: (
  "summary", "education", "skills", "experience", "projects",
  "certifications", "leadership", "achievements", "competitions",
  "extracurricular", "publications", "openSource", "languages", "hobbies",
))

#for section-key in section-order {
  if section-key == "summary" { render-summary() }
  else if section-key == "education" { render-education() }
  else if section-key == "skills" { render-skills() }
  else if section-key == "experience" { render-experience() }
  else if section-key == "projects" { render-projects() }
  else if section-key == "certifications" { render-certifications() }
  else if section-key == "leadership" { render-custom-section(data.at("leadership", default: none)) }
  else if section-key == "achievements" { render-custom-section(data.at("achievements", default: none)) }
  else if section-key == "competitions" { render-custom-section(data.at("competitions", default: none)) }
  else if section-key == "extracurricular" { render-custom-section(data.at("extracurricular", default: none)) }
  else if section-key == "publications" { render-custom-section(data.at("publications", default: none)) }
  else if section-key == "openSource" { render-custom-section(data.at("openSource", default: none)) }
  else if section-key == "languages" { render-languages() }
  else if section-key == "hobbies" { render-hobbies() }
  else {
    // Dynamic custom sections
    let custom = data.at("customSections", default: ())
    let match = custom.filter(s => field(s, "id") == section-key)
    if match.len() > 0 { render-custom-section(match.first()) }
  }
}
