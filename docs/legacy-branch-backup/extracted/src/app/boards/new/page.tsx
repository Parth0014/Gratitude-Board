'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useState, useSyncExternalStore } from 'react';
import { createLocalBoard, createTemplateBoard } from '@/lib/local-boards';
import { findPhoto, templates, type TemplateId } from '@/lib/starter-content';

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export default function StartBoardPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const ready = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );

  function begin(templateId: TemplateId) {
    try {
      const board = createTemplateBoard(window.localStorage, templateId);
      router.push(`/boards/${board.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not create your board.',
      );
    }
  }

  function beginBlank() {
    try {
      const board = createLocalBoard(window.localStorage, {
        title: 'My vision board',
        entryMode: 'visual',
        themes: [],
      });
      router.push(`/boards/${board.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not create your board.',
      );
    }
  }

  return (
    <main id="main" className="choice-page template-picker">
      <p className="eyebrow">Start in your own way</p>
      <h1>Make a board that feels like yours.</h1>
      <p>
        Choose an example to reshape, or begin with a blank space. These images
        are prompts, not a picture of what your life should look like.
      </p>
      <div className="template-grid">
        {templates.map((template) => (
          <Button
            type="button"
            key={template.id}
            onClick={() => begin(template.id)}
            disabled={!ready}
            variant="outline"
            className="template-choice h-auto whitespace-normal"
          >
            <span className="template-collage" aria-hidden="true">
              {template.photoIds.map((id) => {
                const photo = findPhoto(id)!;
                return (
                  <Image
                    key={id}
                    src={photo.src}
                    alt=""
                    width={240}
                    height={150}
                  />
                );
              })}
            </span>
            <strong>{template.title}</strong>
            <span>{template.intro}</span>
            <em>Use this board →</em>
          </Button>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="blank-board-option h-auto whitespace-normal"
        onClick={beginBlank}
        disabled={!ready}
      >
        <strong>Start with a blank board</strong>
        <span>Bring your own words or photos, at your own pace.</span>
        <span aria-hidden="true">→</span>
      </Button>
      <p className="field-help">
        Every piece can be replaced. Boards are private to this browser for now;
        download a backup if you want to keep a separate copy.
      </p>
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
    </main>
  );
}
