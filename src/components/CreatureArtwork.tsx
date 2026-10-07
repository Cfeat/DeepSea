import { useState } from "react";
import type { Creature } from "../data/types";

// Original, deliberately schematic outlines. No generated photograph or species-ID claim.
const fish =
  "M56 96Q102 43 189 79L239 54L228 98L240 139L189 114Q107 155 56 96ZM121 70L146 47L170 73M121 124L144 149L162 122";
const shark =
  "M40 100Q99 78 158 85L149 53L185 84L223 95L257 52L249 104L262 143L221 113L181 114L157 142L166 112Q86 124 40 100Z";
const squid =
  "M68 92L138 47L197 91L137 125Z M193 92Q252 53 275 67M193 96Q254 92 279 79M193 102Q247 134 278 119M191 106Q213 148 258 152";
const octopus =
  "M111 88C91 23 204 23 182 88L166 115Q198 144 230 120Q220 160 160 125Q178 169 200 167Q171 185 148 128Q131 186 98 172Q128 153 133 125Q87 157 65 138Q102 138 117 112Z";
const jelly =
  "M84 99C71 26 225 26 218 99Q152 132 84 99Z M95 108Q72 138 101 160M116 116Q142 147 111 181M139 120Q122 157 145 189M164 120Q184 148 160 183M187 114Q171 143 192 166M211 108Q234 135 210 155";
const crab =
  "M127 95Q150 75 176 95L184 120Q150 143 118 120Z M125 99L85 73L47 25M122 106L77 102L36 65M122 114L80 132L43 163M127 123L99 148L87 184M177 99L219 73L260 25M180 106L230 103L276 65M180 114L228 132L270 163M175 123L204 148L216 184";
const worm =
  "M84 180L94 94L114 93L119 182ZM128 179L139 62L159 61L166 180ZM184 182L183 116L204 115L219 182Z M104 94L76 57L106 70L117 41L125 69L140 58L114 94M149 64L122 27L149 37L156 15L172 37L191 27L159 64M192 115L169 78L195 91L207 61L214 91L235 82L204 115";
const sealike =
  "M88 110Q86 69 132 70Q193 65 215 103Q218 137 144 130L87 113Z M102 121L97 156M124 129L126 163M151 131L156 168M180 127L194 159M205 118L225 145M89 98L65 87M93 92L78 69";

function outline(c: Creature) {
  if (c.id === "hammerhead-shark")
    return "M81 75L113 55L166 62L173 32L188 48L183 84L232 99L268 67L253 104L270 143L230 119L180 124L163 162L156 121L113 112L82 127L91 104Z";
  if (c.id === "barreleye")
    return "M55 96Q54 47 103 56L128 78Q157 74 194 85L240 68L224 98L240 129L194 116Q130 131 70 117Z M133 82L155 66L174 83M132 124L151 142L174 120";
  if (c.id === "blobfish")
    return "M47 96Q50 51 105 63Q147 73 177 93L238 75L217 105L236 133L177 117Q110 146 65 128Q47 119 47 96Z M105 113L89 147L128 133";
  if (c.id === "snailfish")
    return "M52 99Q51 52 111 63Q153 75 188 98L247 87L225 113Q180 140 118 135Q52 134 52 99ZM99 102Q116 116 102 138";
  if (c.id === "dragonfish")
    return "M44 88Q68 70 99 87L227 86L266 65L248 100L268 125L226 112L94 109L53 108L74 96Z M69 107Q66 158 47 152M121 86L161 65L173 87";
  if (c.id === "anglerfish")
    return "M45 96L79 88L56 119Q73 149 130 142Q181 133 199 113L243 145L227 102L242 71L200 88Q165 40 102 58Q55 57 45 96Z M125 139L113 164L151 146";
  if (c.id === "coelacanth")
    return "M42 95Q92 63 167 79L210 65L228 90L259 101L229 109L210 137L170 118Q88 139 42 95Z M107 82L116 53L149 64L142 80M97 117L115 153L144 139L125 120M156 118L171 151L195 138L181 117";
  if (c.id === "giant-isopod")
    return "M58 102Q62 66 115 69L177 75L222 94L239 109L214 124L177 141L115 141Q63 139 58 102Z M86 75L85 137M108 71L108 140M132 72L131 141M154 73L154 142M177 76L177 141M200 83L200 130M78 85L44 65M78 117L44 146M109 140L99 163M133 141L136 168M157 141L173 164M179 140L207 159";
  if (c.id === "amphipod")
    return "M63 111Q40 58 106 48Q175 40 218 108L216 145L190 151L176 131Q170 97 125 90Q79 85 63 111Z M67 87L42 101M63 78L32 66M84 50L83 88M111 48L109 89M140 51L132 91M164 62L152 99M185 77L170 111M202 95L181 126M87 93L79 126M108 93L101 135M130 99L130 145M151 106L157 152";
  if (c.id === "japanese-spider-crab") return crab;
  if (c.id === "hadal-jellyfish") return jelly;
  if (c.id === "giant-tube-worm") return worm;
  if (["giant-isopod", "sea-pig", "amphipod"].includes(c.id)) return sealike;
  if (["octopus", "dumbo-octopus", "vampire-squid"].includes(c.id))
    return octopus;
  if (["giant-squid", "colossal-squid", "firefly-squid"].includes(c.id))
    return squid;
  if (c.id.includes("shark")) return shark;
  if (c.id === "emperor-penguin")
    return "M135 30Q157 22 171 42L187 54L169 59Q192 135 166 165L179 180L154 174L133 180L139 164Q111 141 125 64L86 122L99 93L128 45Z";
  if (c.id === "narwhal")
    return "M33 103L88 98Q104 67 177 85L232 101L260 78L254 106L267 127L230 117Q173 149 112 117L132 139L108 134L91 114Z";
  return fish;
}
export default function CreatureArtwork({
  creature,
  className = "",
}: {
  creature: Creature;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const photo = creature.media && !failed;
  return (
    <div
      className={`creature-art ${photo ? "is-photo" : "is-schematic"} ${className}`}
    >
      {photo ? (
        <img
          src={`${import.meta.env.BASE_URL}${creature.media!.path}`}
          alt={creature.media!.caption}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <svg
          viewBox="0 0 300 200"
          role="img"
          aria-label={`${creature.name}的简化形态示意`}
        >
          <g
            fill="currentColor"
            fillOpacity=".15"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d={outline(creature)} />
          </g>
          {creature.id === "dumbo-octopus" && (
            <g fill="currentColor" opacity=".6">
              <ellipse
                cx="100"
                cy="63"
                rx="16"
                ry="24"
                transform="rotate(-35 100 63)"
              />
              <ellipse
                cx="197"
                cy="62"
                rx="16"
                ry="24"
                transform="rotate(35 197 62)"
              />
            </g>
          )}
          {creature.id === "anglerfish" && (
            <path
              d="M103 79Q83 10 66 58"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          )}
          {creature.id === "anglerfish" && (
            <circle cx="66" cy="58" r="5" fill="#a9f3de" />
          )}
          {creature.id === "clownfish" && (
            <g fill="none" stroke="currentColor" strokeWidth="4" opacity=".6">
              <path d="M93 74Q102 96 92 121M139 71Q149 95 137 126M178 79Q185 98 178 118" />
            </g>
          )}
          {creature.id === "lanternfish" && (
            <g fill="#a9f3de">
              {[95, 112, 129, 146, 163, 180].map((x) => (
                <circle key={x} cx={x} cy="111" r="2.5" />
              ))}
            </g>
          )}
          {creature.id === "sixgill-shark" && (
            <g stroke="currentColor" strokeWidth="1.2">
              {[89, 96, 103, 110, 117, 124].map((x) => (
                <path key={x} d={`M${x} 90L${x - 3} 108`} />
              ))}
            </g>
          )}
          {creature.id === "barreleye" && (
            <g fill="#9fe2b7">
              <circle cx="87" cy="84" r="7" />
              <circle cx="103" cy="81" r="7" />
            </g>
          )}
          <circle cx="80" cy="96" r="2" fill="currentColor" />
        </svg>
      )}
      <span className="art-label">
        {photo ? "实景照片" : failed ? "图片暂不可用 · 形态示意" : "形态示意"}
      </span>
    </div>
  );
}
