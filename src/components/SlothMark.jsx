const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { Image } from "@/components/ui/image";

export const SLOTH_MASCOT =
  "https://media.db.com/images/public/6ad904a46ee43601b4350561/225919bfe_generated_image.png";

export const SLOTH_ICON =
  "https://media.db.com/images/public/6ad904a46ee43601b4350561/fe259f538_generated_image.png";

export default function SlothMark({ size = 40, variant = "icon", className = "" }) {
  const src = variant === "mascot" ? SLOTH_MASCOT : SLOTH_ICON;
  return (
    <Image
      src={src}
      alt="SlothSort sloth mascot"
      fittingType="fit"
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}