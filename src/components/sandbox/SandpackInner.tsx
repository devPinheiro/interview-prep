"use client";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackTests,
  SandpackConsole,
} from "@codesandbox/sandpack-react";
import { useEffect, useState } from "react";

type Props = {
  template: "vanilla-ts" | "react-ts" | "test-ts";
  files: Record<string, { code: string; hidden?: boolean; active?: boolean }>;
  dependencies?: Record<string, string>;
  onPass?: (passed: boolean) => void;
};

export default function SandpackInner({ template, files, dependencies, onPass }: Props) {
  const [passed, setPassed] = useState(false);
  const showPreview = template === "react-ts";
  const showTests = template === "test-ts" || Object.keys(files).some((p) => /\.(test|spec)\./.test(p));

  useEffect(() => {
    onPass?.(passed);
  }, [passed, onPass]);

  return (
    <SandpackProvider
      template={template}
      files={files}
      theme="light"
      customSetup={{ dependencies }}
      options={{
        autorun: true,
        autoReload: true,
        recompileMode: "delayed",
        recompileDelay: 400,
      }}
    >
      <SandpackLayout style={{ border: "none", borderRadius: 0 }}>
        <SandpackCodeEditor
          style={{ height: 360, flex: 1 }}
          showLineNumbers
          showTabs
          wrapContent
        />
        {showPreview && <SandpackPreview style={{ height: 360, flex: 1 }} showOpenInCodeSandbox={false} />}
        {showTests && (
          <div style={{ flex: 1, minWidth: 280, height: 360, overflow: "auto" }}>
            <SandpackTests
              onComplete={(specs) => {
                try {
                  const all = Object.values(specs ?? {}) as Array<{ status?: string }>;
                  const ok =
                    all.length > 0 &&
                    all.every((s) => s.status === "pass" || s.status === "complete");
                  setPassed(ok);
                } catch {
                  setPassed(false);
                }
              }}
            />
          </div>
        )}
        {!showPreview && !showTests && (
          <SandpackConsole style={{ height: 360, flex: 1 }} />
        )}
      </SandpackLayout>
    </SandpackProvider>
  );
}
