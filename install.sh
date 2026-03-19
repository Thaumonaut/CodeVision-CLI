#!/bin/sh
# CodeVision CLI — Installer
#
# Remote install:
#   curl -fsSL https://raw.githubusercontent.com/Thaumonaut/CodeVision-CLI/refs/heads/main/install.sh | sh
#
# Local install (for development/testing — run from repo root):
#   sh install.sh --local

set -e

# ─── Output helpers ───────────────────────────────────────────────────────────

if [ -t 1 ]; then
  BOLD="\033[1m"; GREEN="\033[32m"; RED="\033[31m"; DIM="\033[2m"; YELLOW="\033[33m"; RESET="\033[0m"
else
  BOLD=""; GREEN=""; RED=""; DIM=""; YELLOW=""; RESET=""
fi

ok()   { printf "  ${GREEN}✓${RESET} %s\n" "$1"; }
fail() { printf "\n${RED}Error:${RESET} %s\n\n" "$1" >&2; exit 1; }
info() { printf "  ${DIM}·${RESET} %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }

# ─── Flags ────────────────────────────────────────────────────────────────────

LOCAL=0
for arg in "$@"; do
  [ "$arg" = "--local" ] && LOCAL=1
done

printf "\n${BOLD}╔══════════════════════════════════════╗${RESET}\n"
printf "${BOLD}║     CodeVision CLI — Installer       ║${RESET}\n"
printf "${BOLD}╚══════════════════════════════════════╝${RESET}\n"

if [ "$LOCAL" = "1" ]; then
  printf "  ${YELLOW}local mode${RESET} — installing from repo\n"
fi
printf "\n"

# ─── Already installed? ───────────────────────────────────────────────────────

if command -v cv >/dev/null 2>&1 && cv --help >/dev/null 2>&1; then
  CURRENT=$(cv --help 2>&1 | grep -o 'v[0-9]\+\.[0-9]\+\.[0-9]\+' | head -1 || echo "unknown")
  if [ "$LOCAL" = "1" ]; then
    # In local mode, always reinstall so you can test changes
    info "CodeVision $CURRENT is installed — reinstalling from local files..."
    printf "\n"
  else
    printf "  CodeVision $CURRENT is already installed. Running upgrade...\n\n"
    cv upgrade
    printf "\n${BOLD}${GREEN}✓ CodeVision is up to date.${RESET}\n\n"
    exit 0
  fi
fi

# ─── Prerequisites ────────────────────────────────────────────────────────────

command -v node >/dev/null 2>&1 || fail "Node.js is required (v18+). Install from https://nodejs.org"
command -v npm  >/dev/null 2>&1 || fail "npm is required. Install from https://nodejs.org"

NODE_MAJOR=$(node -e "process.stdout.write(String(process.version.slice(1).split('.')[0]))")
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js v18+ required. Found: $(node --version)"

ok "Node.js $(node --version)"
ok "npm $(npm --version)"

# ─── Setup ────────────────────────────────────────────────────────────────────

CV_HOME="$HOME/.codevision"
CV_CLI="$CV_HOME/CLI"
RAW="https://raw.githubusercontent.com/Thaumonaut/CodeVision-CLI/refs/heads/main"

mkdir -p "$CV_CLI"

# ─── Copy or download CLI files ───────────────────────────────────────────────

if [ "$LOCAL" = "1" ]; then
  # Resolve the repo root relative to this script's location
  SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
  LOCAL_CLI="$SCRIPT_DIR/CLI"
  [ -d "$LOCAL_CLI" ] || fail "CLI/ directory not found at $SCRIPT_DIR — run this from the repo root."

  printf "\n${BOLD}Copying CLI files from $LOCAL_CLI...${RESET}\n\n"
  for f in cv.js cv-migrate.js cv-stories.js cv-prompt.js package.json; do
    printf "  %-28s" "$f"
    if cp "$LOCAL_CLI/$f" "$CV_CLI/$f" 2>/dev/null; then
      printf "${GREEN}✓${RESET}\n"
    else
      printf "${RED}✗${RESET}\n"
      fail "Could not copy $f — is the file missing from CLI/?"
    fi
  done
else
  printf "\n${BOLD}Downloading CLI files...${RESET}\n\n"
  for f in cv.js cv-migrate.js cv-stories.js cv-prompt.js package.json; do
    printf "  %-28s" "$f"
    if curl -fsSL "$RAW/CLI/$f" -o "$CV_CLI/$f" 2>/dev/null; then
      printf "${GREEN}✓${RESET}\n"
    else
      printf "${RED}✗${RESET}\n"
      fail "Failed to download $f — check your internet connection and try again."
    fi
  done
fi

# ─── Install dependencies ─────────────────────────────────────────────────────

printf "\n"
info "Installing dependencies..."
(cd "$CV_CLI" && npm install --omit=dev --silent) || fail "npm install failed."
ok "Dependencies installed"

# ─── Link the cv command ──────────────────────────────────────────────────────

printf "\n"
info "Linking cv command..."
if (cd "$CV_CLI" && npm link --silent 2>/dev/null); then
  ok "cv command linked"
else
  warn "npm link failed without sudo. Trying with sudo..."
  if (cd "$CV_CLI" && sudo npm link); then
    ok "cv command linked (via sudo)"
  else
    fail "Could not link the cv command. Try manually: cd $CV_CLI && npm link"
  fi
fi

# ─── Copy or download command files ───────────────────────────────────────────

if [ "$LOCAL" = "1" ]; then
  LOCAL_COMMANDS="$SCRIPT_DIR/Commands"
  [ -d "$LOCAL_COMMANDS" ] || fail "Commands/ directory not found at $SCRIPT_DIR"

  CV_COMMANDS="$CV_HOME/Commands"
  if [ -d "$CV_COMMANDS" ]; then
    rm -rf "$CV_COMMANDS"
    info "Cleared Commands/"
  fi
  mkdir -p "$CV_COMMANDS"

  printf "\n${BOLD}Copying command files from $LOCAL_COMMANDS...${RESET}\n\n"
  COUNT=0
  for f in "$LOCAL_COMMANDS"/*.md; do
    [ -f "$f" ] || continue
    cp "$f" "$CV_COMMANDS/"
    COUNT=$((COUNT + 1))
  done
  ok "$COUNT command files copied"
else
  printf "\n${BOLD}Downloading command files...${RESET}\n\n"
  node "$CV_CLI/cv.js" upgrade --force
fi

# ─── Done ─────────────────────────────────────────────────────────────────────

printf "\n${BOLD}${GREEN}✓ CodeVision is installed.${RESET}\n\n"
printf "  Run ${BOLD}cv init${RESET} in your project to get started.\n"
printf "  Run ${BOLD}cv --help${RESET} to see all commands.\n\n"
