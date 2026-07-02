/**
 * Prefer stack pop; optionally navigate to a fallback screen when the stack cannot go back.
 */
export function goBackOrNavigate(navigation, fallback) {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }

  if (fallback?.screen) {
    navigation.navigate(fallback.screen, fallback.params);
  }
}

export function resetToScreen(navigation, screen, params) {
  navigation.reset({
    index: 0,
    routes: [{ name: screen, params }],
  });
}
