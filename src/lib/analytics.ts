/**
 * Lightweight analytics/event tracking utility
 * 
 * This provides a simple interface for tracking user actions throughout the app.
 * Currently logs to console, but can be easily extended to integrate with
 * analytics providers (Google Analytics, Mixpanel, PostHog, etc.)
 */

type EventName = 
  | "cta_click"
  | "game_started"
  | "game_completed"
  | "game_saved"
  | "signup_started"
  | "signup_completed"
  | "signin_completed"
  | "first_game_guide_dismissed"
  | "signup_prompt_dismissed";

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an event with optional properties
 */
export function trackEvent(eventName: EventName, properties?: EventProperties) {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", eventName, properties || {});
  }

  // TODO: Integrate with analytics provider
  // Example integrations:
  // - Google Analytics: gtag('event', eventName, properties)
  // - Mixpanel: mixpanel.track(eventName, properties)
  // - PostHog: posthog.capture(eventName, properties)
  // - Custom API: fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ eventName, properties }) })
}

/**
 * Track CTA clicks (buttons, links that lead to key actions)
 */
export function trackCTAClick(ctaType: "start_scoring" | "signup" | "signin" | "play_again" | "new_game", location?: string) {
  trackEvent("cta_click", { cta_type: ctaType, location });
}

/**
 * Track game-related events
 */
export function trackGameStarted(mode: "anonymous" | "authenticated") {
  trackEvent("game_started", { mode });
}

export function trackGameCompleted(score: number, mode: "anonymous" | "authenticated") {
  trackEvent("game_completed", { score, mode });
}

export function trackGameSaved(gameId: number) {
  trackEvent("game_saved", { game_id: gameId });
}

/**
 * Track authentication events
 */
export function trackSignupStarted(source?: string) {
  trackEvent("signup_started", { source });
}

export function trackSignupCompleted() {
  trackEvent("signup_completed");
}

export function trackSigninCompleted() {
  trackEvent("signin_completed");
}

/**
 * Track onboarding/guidance interactions
 */
export function trackFirstGameGuideDismissed() {
  trackEvent("first_game_guide_dismissed");
}

export function trackSignupPromptDismissed(action: "signed_up" | "play_again" | "maybe_later") {
  trackEvent("signup_prompt_dismissed", { action });
}

