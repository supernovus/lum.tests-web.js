# Meta-repo path
LUMJS_REL_PATH="../../../.."

# Temporary link to core package
@lumjs_post_update() {
  echo "Linking non-published packages"
  @lumjs tests-web
}

