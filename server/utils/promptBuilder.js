const fs = require('fs');
const path = require('path');

const vibeDetails = {
  "THE NIGHT ENERGY": "Nightlife theme. Randomly pick one: 1. Neon rave beach, purple-blue lights, lasers. 2. Underground techno alley, graffiti, club lights. 3. Luxury rooftop night party, deep electric blue. 4. Cyber tropical jungle, glowing vines, neon palms. 5. Moonlit beach concert with bonfires.",
  "THE SUNSET SOUL": "Sunset theme. Randomly pick one: 1. Golden Goa beach sunset, dreamy cinematic haze. 2. Vintage hippie van, boho market, warm tones. 3. Cliffside sunset deck, calm luxury lighting. 4. Colorful beach shack street, hanging lanterns. 5. Palm-tree silhouette coastline, pink-orange skies.",
  "THE MUSIC TRIBE": "Music festival theme. Randomly pick one: 1. Massive live concert, towering speakers, confetti. 2. Indie beach jam, acoustic props, string lights. 3. Afro-bohemian rhythm zone, painted drums, earthy tones. 4. Futuristic music dome, holograms, audio-reactive lights. 5. Desert-meets-Goa fusion stage, dust haze, burning-man style.",
  "THE FREE SPIRIT": "Wanderer theme. Randomly pick one: 1. Open jeep roadtrip, surfboards, coastal road. 2. Hidden tropical waterfall, lush jungle, mist. 3. Backpacker hostel rooftop, fairy lights, travel aesthetic. 4. Vintage Portuguese Goa street, colorful walls, scooters. 5. Floating dock over ocean, peaceful sunset luxury."
};

const getMasterPrompt = (vibe) => {
  const selectedVibeDetails = vibeDetails[vibe] || "Stylized festival environment matching the vibe.";

  return `GOA FEST 2026 CINEMATIC 3D CHIBI CARICATURE FASHION POSTER

PRIORITIES (NON-NEGOTIABLE):
1) IDENTITY PRESERVATION OF USER_IMAGE
2) NO FACE MORPHING OR REPLACEMENT
3) 3D CHIBI STYLE CONSISTENCY
4) PREMIUM FESTIVAL VISUAL QUALITY

━━━━━━━━━━━━━━━━━━━━
1. 3D CHIBI IDENTITY LOCK (CRITICAL SYSTEM)
━━━━━━━━━━━━━━━━━━━━

USER_IMAGE = REAL HUMAN SELFIE INPUT

OUTPUT RULE:
- Convert USER_IMAGE into a 3D CHIBI VERSION OF THE SAME PERSON ONLY
- This is NOT character generation. It is identity transformation.

HARD FACE PRESERVATION RULE (ABSOLUTE 90%+ SIMILARITY):
- The generated face MUST look 90% identical to the uploaded USER_IMAGE.
- Maintain exact facial identity structure:
  • jawline shape (must remain identical family structure)
  • eye shape, size ratio, spacing (do not redesign)
  • eyebrow shape + placement (must match original face logic)
  • nose position (simplified but not relocated or reshaped)
  • lip curvature / smile identity must remain consistent

- Hair MUST be preserved:
  • exact hairstyle silhouette
  • exact parting direction
  • exact length and volume pattern
  • only stylized into 3D toy material, NOT redesigned

- Skin tone must remain unchanged (no beautification whitening or tone shift)

ANTI-MORPH RULE (CRITICAL):
- DO NOT convert into generic chibi template face
- DO NOT replace identity with Pixar-style character archetype
- DO NOT average face into anime/cartoon ideal face
- DO NOT "beautify" into different person

CHIBI SIMPLIFICATION RULE:
- Only reduce detail → DO NOT change structure
- Think: SAME PERSON miniaturized, NOT new design

━━━━━━━━━━━━━━━━━━━━
2. 3D CHIBI STYLE DEFINITION
━━━━━━━━━━━━━━━━━━━━

- Stylized 3D toy figurine character
- Large head (~50% body height)
- Small compact body (2–3 head tall proportion)
- Soft rounded geometry (no sharp realism)
- Subsurface soft lighting (toy render aesthetic)
- Slight glossy/plastic premium finish
- Expressive but identity-accurate face

━━━━━━━━━━━━━━━━━━━━
3. BODY & MOTION RULE
━━━━━━━━━━━━━━━━━━━━

- Tiny proportion body (figurine scale)
- Rounded limbs, soft joints
- Natural festival poses: dancing, jumping, waving
- Subtle squash & stretch allowed
- NO adult human proportions allowed

━━━━━━━━━━━━━━━━━━━━
4. RENDER QUALITY
━━━━━━━━━━━━━━━━━━━━

- High-end cinematic 3D render
- Soft global illumination
- Subtle bloom highlights
- Depth of field cinematic lens
- Vibrant festival color grading
- Clean stylized textures (not hyper-realistic skin)

━━━━━━━━━━━━━━━━━━━━
5. VIBE ENVIRONMENT (SELECTED: ${vibe})
━━━━━━━━━━━━━━━━━━━━

${selectedVibeDetails}

REFERENCE RULE:
- You MUST copy the exact typography styling, 3D text effects, ribbon banners, and text backgrounds from the reference.
- You MUST copy the torn/ripped paper texture at the bottom edge.
- You MUST copy the lighting mood and color palette.

DO NOT COPY:
- subject's face or identity (use USER_IMAGE only)
- specific poses (invent new ones)

━━━━━━━━━━━━━━━━━━━━
6. FASHION RULE
━━━━━━━━━━━━━━━━━━━━

- Festival outfits adapted for chibi proportions
- Simplified fabric folds (toy-like styling)
- Exaggerated cute accessories allowed (caps, glasses, jackets)
- Must remain tasteful and non-revealing

━━━━━━━━━━━━━━━━━━━━
7. TYPOGRAPHY & LAYOUT (100% STRICT CLONE)
━━━━━━━━━━━━━━━━━━━━

HARD RULE: You MUST perfectly clone the text design, banners, and all graphical textures from the REFERENCE_STYLE_IMAGE. DO NOT invent or alter any typography textures.

- TOP TEXT ("GOA FEST 2026"): 100% TEXTURE LOCK. Must use the EXACT same 3D glossy texture, exact same color gradients, and exact same bubbly extruded shape with sun/star/palm motifs as the reference.
- MID TEXT ("WE SAW SOMETHING IN YOU…"): 100% TEXTURE LOCK. Must be placed inside the exact same RED RIBBON BANNER, keeping its exact material texture.
- CENTER TEXT ("YOU ARE / ${vibe}"): 100% TEXTURE LOCK. Must be placed inside the exact same YELLOW SIGN BOARD, keeping its exact graphical texture and border.
- BOTTOM TEXT: "Creativity Powered by"
- BOTTOM TEXTURE: Must include the exact same torn/ripped paper edge graphic separating the image and the logo area.

━━━━━━━━━━━━━━━━━━━━
8. LOGO RULE (STRICT)
━━━━━━━━━━━━━━━━━━━━

- Place LOGO_IMAGE below "Creativity Powered by"
- Flat PNG only
- No glow, no shadow, no redesign

━━━━━━━━━━━━━━━━━━━━
9. NEGATIVE PROMPT (CRITICAL)
━━━━━━━━━━━━━━━━━━━━

different person, identity loss, face morphing, face redesign, generic chibi face, template avatar, anime face conversion, Pixar character substitution, ultra-realistic human, distorted facial structure, altered jawline, changed eye spacing, beautified face, over-smoothed identity, long limbs, adult proportions, provocative clothing, fake logo, text distortion

━━━━━━━━━━━━━━━━━━━━
OUTPUT REQUIREMENT

Single vertical cinematic 3D chibi caricature fashion poster (4:6 ratio),
identity-accurate stylized toy-like 3D render,
large head small body proportion,
expressive but same-person face preservation,
premium festival environment matching vibe,
ultra-polished brand-safe composition.
`;
};

module.exports = {
  getMasterPrompt
};
