import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getOutbreakCases, getSignals, subscribeEmail, isEmailSubscribed, getEmailSubscribers } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Outbreak tracker procedures
  outbreak: router({
    /**
     * Fetch all outbreak cases with summary statistics.
     */
    getCases: publicProcedure.query(async () => {
      const cases = await getOutbreakCases();
      
      // Calculate summary stats
      const totalConfirmed = cases.reduce((sum, c) => sum + (c.confirmedCount || 0), 0);
      const totalDeaths = cases.reduce((sum, c) => sum + (c.deaths || 0), 0);
      const affectedCountries = cases.length;
      
      return {
        cases,
        summary: {
          totalConfirmed,
          totalDeaths,
          affectedCountries,
          lastUpdated: cases.length > 0 ? cases[0]?.dateReported : new Date(),
        },
      };
    }),

    /**
     * Fetch a single outbreak case by ID for detail view.
     */
    getCaseById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        // Implementation: fetch case by ID
        return null;
      }),

    /**
     * Get delta (changes) since last update: new cases, new countries, hours since change.
     */
    getDelta: publicProcedure.query(async () => {
      const cases = await getOutbreakCases();
      
      // Simplified delta: if we have cases, show the latest one
      if (cases.length === 0) {
        return {
          newCases: 0,
          newCountries: [],
          hoursSinceChange: 0,
          hasChange: false,
        };
      }

      const latest = cases[0];
      const now = new Date();
      const hoursSince = Math.floor((now.getTime() - (latest?.dateReported?.getTime() || 0)) / (1000 * 60 * 60));

      return {
        newCases: latest?.confirmedCount || 0,
        newCountries: [latest?.location || ""],
        hoursSinceChange: hoursSince,
        hasChange: hoursSince < 24,
      };
    }),
  }),

  // Signals (outbreak reports) procedures
  signals: router({
    /**
     * Fetch all signals (outbreak reports).
     */
    getAll: publicProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        const limit = input?.limit || 50;
        const allSignals = await getSignals(limit);
        return allSignals;
      }),

    /**
     * Fetch signals by region.
     */
    getByRegion: publicProcedure
      .input(z.object({ region: z.string() }))
      .query(async ({ input }) => {
        const allSignals = await getSignals(100);
        return allSignals.filter(s => s.region === input.region);
      }),
  }),

  // Email subscription procedures
  subscription: router({
    /**
     * Subscribe an email to the newsletter.
     */
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          // Check if already subscribed
          const alreadySubscribed = await isEmailSubscribed(input.email);
          if (alreadySubscribed) {
            return {
              success: false,
              message: "Email already subscribed",
            };
          }

          // Subscribe
          await subscribeEmail(input.email);

          // Notify owner
          await notifyOwner({
            title: "New Newsletter Subscriber",
            content: `New subscriber: ${input.email}`,
          });

          return {
            success: true,
            message: "Successfully subscribed to newsletter",
          };
        } catch (error) {
          console.error("[Subscription] Failed to subscribe:", error);
          return {
            success: false,
            message: "Failed to subscribe. Please try again.",
          };
        }
      }),

    /**
     * Check if an email is subscribed.
     */
    isSubscribed: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const subscribed = await isEmailSubscribed(input.email);
        return { subscribed };
      }),
  }),
});

export type AppRouter = typeof appRouter;
