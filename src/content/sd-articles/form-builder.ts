import type { SystemDesignGuide } from "@/lib/types";

export const formBuilderGuide: SystemDesignGuide = {
  sections: [
    {
      id: "requirements",
      title: "Requirements",
      body: `Authors build a form by adding fields, validation, and simple logic. Respondents fill the published version. Responses stay tied to the field ids that existed when they were submitted.

What you commit to:

- The schema is the source of truth. The canvas and the preview render it. You do not store a pile of absolute-positioned inputs as the form.
- Publishing freezes a version. Editing the draft afterward does not rewrite old responses. A deleted field disappears from new responses and remains in old ones.
- Conditional logic is data (“show field B when A is yes”), evaluated the same way in the builder preview and in the respondent runtime.
- The generated form is accessible: labels, descriptions, errors, groups, and a keyboard path. The builder is too.
- Validation runs in the client for speed and on the server when the response is submitted. The server is the gate.

Scale: forms with dozens of fields, not thousands. Responses can be numerous. The builder is low-traffic. The respondent page should be small and cacheable per published version.

Out of scope: a payment engine and a workflow approver chain. File upload can exist as a field type that uses a signed URL. Multi-page forms are in scope if you model pages as sections of the same schema.`,
    },
    {
      id: "architecture",
      title: "Architecture",
      body: `Builder and runtime share a renderer.

The builder holds a draft schema: ordered fields, each with a type, label, required flag, validation, and options. Reorder changes the order array. Selecting a field opens an inspector. Preview runs the respondent renderer against the draft in a pane or a route, with no chrome from the builder.

The respondent app loads one published version and keeps answers in memory keyed by field id. Visibility is derived: evaluate rules in order, hide fields, and do not submit hidden answers, or submit them but ignore them. Pick one and make the server agree. Required is enforced only on visible fields.

Submit POSTs \`{ versionId, answers }\`. The server validates against that version. Errors return per field id. The client maps them onto the controls.

Logic: a small interpreter, not user-supplied JavaScript. Comparisons against option values and numbers. If the rule references a missing field, the builder flags it. Cycles are rejected when the rule is saved.

## Versioning

Save draft often. Publish copies the draft to an immutable version and returns the public URL that includes the version or points at “latest,” which redirects to a specific version so a response always names what it was filled against. “Latest” that changes under a respondent mid-fill is a bug. Load a version and keep it for the session.

## Builder accessibility

The field list is keyboard reorderable. The canvas is not the only place a field exists. A list of fields by label lets you select without dragging. Drag is an extra.`,
      diagram: {
        caption: "One schema feeds the builder and the preview. Respondents bind answers to a published version.",
        mermaid: `flowchart TB
  Builder[Builder]
  Draft[Draft schema]
  Renderer[Field renderer]
  Version[Published version]
  Answers[Answer map]
  API[Submit API]
  Builder --> Draft
  Draft --> Renderer
  Version --> Renderer
  Renderer --> Answers
  Answers --> API
  Version --> API`,
      },
    },
    {
      id: "data",
      title: "Data model",
      body: `Field: \`{ id, type, label, help, required, options?, validation?, logic? }\`. Types include short text, long text, number, single choice, multi choice, date, and file. The id is stable for the life of the field. The label can change, and old responses still display with the label you stored at submit time or with a lookup that records the label on the response. Store the label snapshot on the response so a rename does not rewrite history.

Logic clause: \`{ fieldId, op, value, action, targetFieldId }\`. Keep the grammar small.

Schema: \`{ id, title, fieldIds, fields, draftVersion }\`.

Published: \`{ versionId, schema, publishedAt }\`.

Response: \`{ id, versionId, answers: [{ fieldId, value, label }], submittedAt }\`. Values are typed JSON, not a single string you parse later. Files are asset ids.

Respondent in-progress state can sit in session storage so a refresh does not clear a long form, keyed by version id. It is not the system of record. Submitted data is the POST.

Spam: a server-side rate limit and a honeypot or equivalent. Do not make a captcha the only design you mention, and do not skip abuse control on a public form.`,
    },
    {
      id: "interfaces",
      title: "Interfaces",
      body: `\`\`\`
GET /forms/{id}/draft
→ { schema, draftVersion }

PUT /forms/{id}/draft
{ schema, draftVersion }
→ { draftVersion } or 409

POST /forms/{id}/publish
→ { versionId, publicUrl }

GET /f/{versionId}
→ { schema }

POST /f/{versionId}/responses
{ answers }
→ { id } or { errors: [{ fieldId, message }] }
\`\`\`

The respondent form is a real form element. Each control has a label tied by id. Help text is \`aria-describedby\`. Errors use \`aria-invalid\` and are summarized at the top with links to fields. Groups of radios are fieldsets. A multi-page form has an explicit next button and does not trap focus.

The builder inspector labels its own inputs. Publishing with a logic error or a field without a label is blocked with a list of problems.

Do not render respondent labels with HTML from the author. Text, or a sanitized subset you can defend.`,
      diagram: {
        caption: "Submit is checked against the published version. Field errors come back by id.",
        mermaid: `sequenceDiagram
  participant User
  participant Form
  participant API
  User->>Form: Submit
  Form->>API: answers plus version
  alt valid
    API-->>Form: response id
  else invalid
    API-->>Form: errors by field id
    Form->>User: focus first error
  end`,
      },
    },
    {
      id: "deep-dives",
      title: "Deep dives",
      body: `## Logic without a scripting language

Authors will ask for JavaScript. Refuse it in the schema. A script cannot be previewed safely, cannot be analyzed for cycles, and becomes an XSS hole if it ever runs in the respondent origin with cookies. Ship comparisons and AND/OR groups. If you need more, compile a restricted expression whose AST you store. The interpreter is shared code so preview and production match.

## Changing a form that already has responses

Removing an option that people picked: keep the option value on old responses and stop offering it. Changing a field type is not an in-place edit. Create a new field and retire the old one, or the numbers become strings underneath you. The version id on each response is how exports stay honest. Exports read the version’s schema to name columns, and they include a column even if a later version deleted it.

## File fields

The file control uploads to a signed URL first and puts the asset id in the answer. Submit of the form then only sends ids. Limits on size and mime are checked before the upload and again on the server. A half-uploaded file does not count as an answer. Progress is per field.

## Accessibility of the builder versus the form

It is easy to ship a pretty canvas and a broken form. Test the runtime with a keyboard and a label audit as part of the design, because that is the product respondents get. The builder can be more complex, but the field list, not the drag layer, is the accessible structure. Announce validation errors in the runtime. Do not rely on color for required or for errors.`,
    },
  ],
};
