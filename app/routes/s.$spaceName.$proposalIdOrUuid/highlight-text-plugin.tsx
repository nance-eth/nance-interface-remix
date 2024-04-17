import { Nodes } from "hast";
import { visit } from "unist-util-visit";
import type { VFile } from "vfile";
import { classnames } from "hast-util-classnames";

export interface HighlightPattern {
  textStart: string;
  textEnd: string;
  prefix: string;
  suffix: string;
}

/**
 * [prefix-,]textStart[,textEnd][,-suffix]
 */
function patternParse(pattern: string): HighlightPattern {
  const parts = pattern.split(",");

  if (parts.length === 1) {
    return {
      prefix: "",
      textStart: parts[0],
      textEnd: "",
      suffix: "",
    };
  }

  if (parts.length === 2) {
    if (parts[0].endsWith("-")) {
      return {
        prefix: parts[0].slice(0, parts[0].length - 1),
        textStart: parts[1],
        textEnd: "",
        suffix: "",
      };
    } else {
      return {
        prefix: "",
        textStart: parts[0],
        textEnd: parts[1],
        suffix: "",
      };
    }
  }

  if (parts.length === 3) {
    if (parts[0].endsWith("-")) {
      return {
        prefix: parts[0].slice(0, parts[0].length - 1),
        textStart: parts[1],
        textEnd: parts[2],
        suffix: "",
      };
    } else {
      return {
        prefix: "",
        textStart: parts[0],
        textEnd: parts[1],
        suffix: parts[2].slice(1, parts[0].length),
      };
    }
  }

  if (parts.length === 4) {
    return {
      prefix: parts[0].slice(0, parts[0].length - 1),
      textStart: parts[1],
      textEnd: parts[2],
      suffix: parts[3].slice(1, parts[0].length),
    };
  }

  throw new Error(`not recognized pattern: ${pattern}`);
}

export default function rehypeHighlightText(
  pattern: string | null | undefined,
) {
  return (tree: Nodes, file: VFile) => {
    if (!pattern) return;

    const p = patternParse(pattern);
    // ?quote=500%20-,equivalent,these%20days,-%20ar
    const regex = new RegExp(
      `${p.prefix}(${p.textStart}[\\s\\S]*?${p.textEnd})${p.suffix}`,
      "g",
    );
    const m = regex.exec(file.value as string);

    if (m) {
      const matchText = m[1];
      const mIndex = m.index;

      visit(tree, "text", function (node, index, parent) {
        if (parent && parent.type === "element" && parent.position) {
          const start = parent.position.start.offset || 0;
          const end = parent.position.end.offset || 0;
          const inBetween = start <= mIndex && end >= mIndex;
          const textInclude =
            matchText?.includes(node.value) && node.value !== "\n";
          if (inBetween || textInclude) {
            classnames(parent, "bg-purple-100");
            console.debug("match", { text: node.value, parent });
          }
        }
      });
    }
  };
}
