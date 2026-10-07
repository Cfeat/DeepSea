import type { DiveTopic } from "../data/types";
export default function TopicDiagram({ kind }: { kind: DiveTopic["kind"] }) {
  return (
    <svg viewBox="0 0 220 160" className="topic-diagram" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        {kind === "snow" && (
          <>
            {Array.from({ length: 18 }, (_, i) => (
              <circle
                key={i}
                cx={25 + ((i * 47) % 175)}
                cy={15 + ((i * 37) % 125)}
                r={1 + (i % 3)}
                fill="currentColor"
                opacity={0.25 + (i % 3) * 0.2}
              />
            ))}
            <path d="M30 139Q100 116 193 139M109 20V104M103 98L109 104L115 98" />
          </>
        )}
        {kind === "vent" && (
          <>
            <path d="M15 141L70 121L85 75L107 82L123 126L145 106L162 134L201 143M94 70Q66 47 94 31M104 73Q131 53 104 17M123 58Q150 41 123 24" />
            <path d="M143 125V77M153 128V96M161 133V82" stroke="#edb295" />
            <path
              d="M136 78L143 64L150 78M154 83L161 65L168 82"
              stroke="#edb295"
            />
          </>
        )}
        {kind === "whale" && (
          <>
            <path d="M16 142Q105 131 199 141M36 100Q116 115 173 109L194 92L186 114L199 132L174 119Q107 125 37 112ZM51 109L50 134M75 113L72 135M96 116L93 138M117 117L114 138M138 116L136 136M156 114L154 135" />
            <circle cx="40" cy="106" r="3" />
          </>
        )}
        {(kind === "seafloor" || kind === "trench") && (
          <>
            <path d="M12 48H204" strokeDasharray="4 6" />
            <path
              d={
                kind === "trench"
                  ? "M12 90L53 105L93 145L116 144L148 65L182 87L207 84"
                  : "M12 132L52 133L80 109L94 132L124 133L158 69L196 130L207 131"
              }
            />
            <path d="M33 32V82M27 77L33 83L39 77M171 31V54" />
          </>
        )}
        {kind === "survey" && (
          <>
            <path d="M66 30H149L137 45H84ZM99 30V17H126V30M108 46V72M108 72L41 133M108 72L175 133M13 138Q77 125 113 141Q163 151 207 128" />
            <path
              d="M87 86Q108 97 129 86M73 103Q108 122 143 103"
              strokeDasharray="3 5"
            />
          </>
        )}
      </g>
    </svg>
  );
}
