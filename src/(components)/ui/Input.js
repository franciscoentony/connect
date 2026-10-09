"use client";

import {
  TextField,
  Label,
  Input as HeroInput,
  TextArea,
  Description,
} from "@heroui/react";

// Campo de texto com rótulo e dica opcional, feito com o TextField do HeroUI.
//
// Atenção: no HeroUI, o onChange recebe o TEXTO digitado (não o evento).
//   <Input rotulo="E-mail" value={email} onChange={setEmail} />
//
// Outras props: placeholder, type, name, value, defaultValue, desabilitado,
// multilinha (vira uma caixa de texto maior).

export default function Input({
  rotulo,
  dica,
  placeholder,
  type = "text",
  multilinha = false,
  desabilitado = false,
  ...props
}) {
  const classes = "h-auto rounded-xl px-4 py-3.5 text-base";

  return (
    <TextField fullWidth isDisabled={desabilitado} type={type} {...props}>
      {rotulo && (
        <Label className="text-sm font-semibold text-neutral-900">
          {rotulo}
        </Label>
      )}
      {multilinha ? (
        <TextArea
          placeholder={placeholder}
          rows={4}
          className={`${classes} resize-none`}
        />
      ) : (
        <HeroInput placeholder={placeholder} className={classes} />
      )}
      {dica && (
        <Description className="text-xs font-medium text-neutral-500">
          {dica}
        </Description>
      )}
    </TextField>
  );
}
