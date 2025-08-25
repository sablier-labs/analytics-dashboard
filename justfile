# See https://github.com/sablier-labs/devkit/blob/main/just/base.just
import "./node_modules/@sablier/devkit/just/base.just"


# ---------------------------------------------------------------------------- #
#                                 DEPENDENCIES                                 #
# ---------------------------------------------------------------------------- #

# Bun: https://github.com/oven-sh/bun
bun := require("bun")


# ---------------------------------------------------------------------------- #
#                                    RECIPES                                   #
# ---------------------------------------------------------------------------- #

# Default recipe
default:
    just --list

# Clean the .next directory
clean:
    bunx del-cli .next

# ---------------------------------------------------------------------------- #
#                                      APP                                     #
# ---------------------------------------------------------------------------- #

# Build the Next.js app
[group("app")]
@build:
    na next build

# Start the Next.js app in dev mode
[group("app")]
@dev:
    na next dev --turbopack

# Start the Next.js app
[group("app")]
start:
    #!/usr/bin/env sh
    if [ ! -d .next ]; then
        na next build
    fi
    na next start