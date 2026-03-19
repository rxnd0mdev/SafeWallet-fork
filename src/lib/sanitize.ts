type RedactionRule = {
  regex: RegExp;
  replacement: string;
};

const NAME_WORD = String.raw`[A-Z][A-Za-z'-]+`;
const PERSON_TITLE =
  "(?:Mr|Mrs|Ms|Miss|Mx|Dr|Prof|Sir|Madam|Mdm|Bpk|Ibu|Sdr|Sdri|Tuan|Nyonya|Anak|An)";
const ADDRESS_SUFFIX =
  "(?:Street|St\\.?|Road|Rd\\.?|Avenue|Ave\\.?|Boulevard|Blvd\\.?|Lane|Ln\\.?|Drive|Dr\\.?|Way|Court|Ct\\.?|Terrace|Ter\\.?|Place|Pl\\.?|Square|Sq\\.?)";
const ADDRESS_PREFIX =
  "(?:Address|Alamat|Street|St\\.?|Avenue|Ave\\.?|Road|Rd\\.?|Jalan|Jl\\.?|Gang|Gg\\.?|Lorong|Lrg\\.?)";
const REDACTION_TOKEN = /___[A-Z_]+___/;

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?previous\s+instructions/gi,
  /you\s+are\s+now\s+a/gi,
  /forget\s+(all\s+)?your\s+(rules|instructions)/gi,
  /system\s*:\s*/gi,
  /\[INST\]/gi,
  /<<SYS>>/gi,
  /\{\{.*?\}\}/g,
  /```\s*(system|instruction)/gi,
  /act\s+as\s+(if|a)/gi,
  /override\s+(your|all|the)/gi,
  /disregard\s+(all|previous|your)/gi,
];

const LINE_REDACTION_RULES: RedactionRule[] = [
  {
    regex:
      /^(\s*(?:name|full\s+name|nama(?:\s+lengkap)?|recipient|beneficiary|holder|customer|contact\s+person|attention|attn)\s*[:#=-]?\s*).+$/gim,
    replacement: "$1___NAME_REDACTED___",
  },
  {
    regex:
      /^(\s*(?:phone|mobile|whatsapp|wa|telp(?:hone)?|email|e-mail)\s*[:#=-]?\s*).+$/gim,
    replacement: "$1___CONTACT_REDACTED___",
  },
  {
    regex:
      /^(\s*(?:address|alamat|street|st\.?|avenue|ave\.?|road|rd\.?)\s*[:#=-]?\s*).+$/gim,
    replacement: "$1___ADDRESS_REDACTED___",
  },
];

const PII_RULES: RedactionRule[] = [
  {
    regex: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
    replacement: "___CARD_REDACTED___",
  },
  {
    regex: /\b\d{10,16}\b/g,
    replacement: "___ID_REDACTED___",
  },
  {
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacement: "___EMAIL_REDACTED___",
  },
  {
    regex: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: "___IP_REDACTED___",
  },
  {
    regex: /(^|[^\w])(\+?\d[\d(). -]{7,}\d)(?=$|[^\w])/gm,
    replacement: "$1___PHONE_REDACTED___",
  },
  {
    regex:
      /\b((?:name|full\s+name|nama(?:\s+lengkap)?|attention|attn|recipient|beneficiary|holder|customer|contact\s+person)\s*[:\-]?\s*)[A-Z][A-Za-z'-]+(?:\s+[A-Z][A-Za-z'-]+){1,3}\b/gi,
    replacement: "$1___NAME_REDACTED___",
  },
  {
    regex: new RegExp(
      String.raw`\b(${PERSON_TITLE})\.?\s+${NAME_WORD}(?:\s+${NAME_WORD}){0,3}\b`,
      "gi"
    ),
    replacement: "$1 ___NAME_REDACTED___",
  },
  {
    regex: /\b((?:address|alamat)\s*[:\-]?\s*)[^\n]+/gi,
    replacement: "$1___ADDRESS_REDACTED___",
  },
  {
    regex: new RegExp(
      String.raw`\b\d{1,5}[A-Za-z]?(?:\s+[A-Za-z0-9.'-]+){0,6}\s+${ADDRESS_SUFFIX}\b(?:,?\s+[A-Za-z0-9.'-]+){0,4}`,
      "gi"
    ),
    replacement: "___ADDRESS_REDACTED___",
  },
  {
    regex: new RegExp(
      String.raw`\b${ADDRESS_PREFIX}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,6}(?:\s+(?:No\.?|RT|RW)\s*[A-Za-z0-9/-]+)?`,
      "gi"
    ),
    replacement: "___ADDRESS_REDACTED___",
  },
  {
    regex:
      /\b((?:rek|no\.?\s*rek|account(?:\s+number)?|acc(?:ount)?|va|virtual\s+account|no\.?\s*hp|telp(?:hone)?|phone|mobile|pin|nik|ssn|tin|passport|card(?:\s+number)?|cvv|swift|iban)\s*(?::|#|=|\.|\bis\b)\s*)(?=[A-Z0-9@._+\-/ ]{4,}\b)(?=[A-Z0-9@._+\-/ ]*[0-9@])[A-Z0-9@._+\-/ ]+\b/gi,
    replacement: "$1___REDACTED___",
  },
];

const FAIL_CLOSED_RULES: RedactionRule[] = [
  {
    regex: new RegExp(
      String.raw`\b(${PERSON_TITLE})\.?\s+${NAME_WORD}(?:\s+${NAME_WORD}){1,3}\b`,
      "gi"
    ),
    replacement: "$1 ___NAME_REDACTED___",
  },
  {
    regex: new RegExp(
      String.raw`\b\d{1,5}[A-Za-z]?(?:\s+[A-Za-z0-9.'-]+){0,6}\s+${ADDRESS_SUFFIX}\b(?:,?\s+[A-Za-z0-9.'-]+){0,4}`,
      "gi"
    ),
    replacement: "___ADDRESS_REDACTED___",
  },
  {
    regex: new RegExp(
      String.raw`\b${ADDRESS_PREFIX}\s+[A-Za-z0-9.'-]+(?:\s+[A-Za-z0-9.'-]+){0,6}(?:\s+(?:No\.?|RT|RW)\s*[A-Za-z0-9/-]+)?`,
      "gi"
    ),
    replacement: "___ADDRESS_REDACTED___",
  },
];

const RESIDUAL_PII_PATTERNS: RegExp[] = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b\d{10,16}\b/g,
  /(^|[^\w])(\+?\d[\d(). -]{7,}\d)(?=$|[^\w])/gm,
  new RegExp(
    String.raw`\b(${PERSON_TITLE})\.?\s+${NAME_WORD}(?:\s+${NAME_WORD}){1,3}\b`,
    "gi"
  ),
  new RegExp(
    String.raw`\b\d{1,5}[A-Za-z]?(?:\s+[A-Za-z0-9.'-]+){0,6}\s+${ADDRESS_SUFFIX}\b(?:,?\s+[A-Za-z0-9.'-]+){0,4}`,
    "gi"
  ),
  new RegExp(
    String.raw`\b(?:name|full\s+name|nama(?:\s+lengkap)?|address|alamat|street|st\.?|avenue|ave\.?|road|rd\.?|phone|mobile|email)\s*[:#=-]?\s*(?!___)[^\n]+`,
    "gi"
  ),
];

function applyRule(
  input: string,
  { regex, replacement }: RedactionRule
): [string, boolean] {
  const next = input.replace(regex, replacement);
  return [next, next !== input];
}

function hasResidualPii(input: string) {
  return RESIDUAL_PII_PATTERNS.some((pattern) => {
    const matches = input.match(pattern);

    if (!matches) {
      return false;
    }

    return matches.some((match) => !REDACTION_TOKEN.test(match));
  });
}

export function sanitizeAIInput(input: string, maxLength = 5000): {
  sanitized: string;
  warnings: string[];
  blocked: boolean;
} {
  const warnings: string[] = [];

  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
    warnings.push(`Input dipotong ke ${maxLength} karakter.`);
  }

  let injectionDetected = false;
  for (const pattern of INJECTION_PATTERNS) {
    const next = sanitized.replace(pattern, "___FILTERED___");
    if (next !== sanitized) {
      injectionDetected = true;
      sanitized = next;
    }
  }

  if (injectionDetected) {
    warnings.push("Pola mencurigakan terdeteksi dan dihapus.");
  }

  let piiDetected = false;
  for (const rule of LINE_REDACTION_RULES) {
    const [next, changed] = applyRule(sanitized, rule);
    if (changed) {
      piiDetected = true;
      sanitized = next;
    }
  }

  for (const rule of PII_RULES) {
    const [next, changed] = applyRule(sanitized, rule);
    if (changed) {
      piiDetected = true;
      sanitized = next;
    }
  }

  for (const rule of FAIL_CLOSED_RULES) {
    const [next, changed] = applyRule(sanitized, rule);
    if (changed) {
      piiDetected = true;
      sanitized = next;
    }
  }

  if (piiDetected) {
    warnings.push(
      "Data sensitif (PII) telah disamarkan secara otomatis demi privasi Anda."
    );
  }

  sanitized = sanitized
    .replace(/\n{3,}/g, "\n\n")
    .replace(/ {3,}/g, "  ")
    .trim();

  const blocked = hasResidualPii(sanitized);

  if (blocked) {
    warnings.push("Input diblokir karena masih terdeteksi potensi PII yang belum aman.");
  }

  return { sanitized, warnings, blocked };
}

export function sanitizeScamInput(content: string): {
  sanitized: string;
  isClean: boolean;
} {
  const { sanitized, blocked } = sanitizeAIInput(content, 3000);
  return {
    sanitized,
    isClean: !blocked,
  };
}
