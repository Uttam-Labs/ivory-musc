"use client";

import { useState } from "react";
import type { DocumentActionComponent } from "sanity";
import { useDocumentOperation } from "sanity";

export const DeleteWaitlistSubscriberAction: DocumentActionComponent = (props) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { delete: deleteOperation } = useDocumentOperation(props.id, props.type);

  return {
    label: "Delete subscriber",
    tone: "critical",
    disabled: Boolean(deleteOperation?.disabled),
    onHandle: () => setConfirmOpen(true),
    dialog: confirmOpen
      ? {
          type: "confirm",
          tone: "critical",
          message: "Delete this waitlist subscriber from Sanity? This action cannot be undone.",
          onCancel: () => setConfirmOpen(false),
          onConfirm: () => {
            deleteOperation.execute();
            setConfirmOpen(false);
            props.onComplete();
          },
        }
      : undefined,
  };
};
