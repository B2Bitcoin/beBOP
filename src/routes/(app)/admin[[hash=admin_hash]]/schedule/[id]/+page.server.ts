import { collections } from "$lib/server/database";
import { error, redirect } from "@sveltejs/kit";
import { z } from "zod";
import { adminPrefix } from "$lib/server/admin";
import {
  MAX_NAME_LIMIT,
  MAX_SHORT_DESCRIPTION_LIMIT,
} from "$lib/types/Product";
import { set } from "lodash-es";
import type { JsonObject } from "type-fest";

export const actions = {
  update: async function ({ request, params }) {
    const schedule = await collections.schedules.findOne({
      _id: params.id,
    });

    if (!schedule) {
      throw error(404, "Schedule not found");
    }
    const data = await request.formData();
    const json: JsonObject = {};
    for (const [key, value] of data) {
      set(json, key, value);
    }
    const parsed = z
      .object({
        name: z.string().trim().min(1).max(MAX_NAME_LIMIT),
        pastEventDelay: z
          .string()
          .regex(/^\d+(\.\d+)?$/)
          .default("60"),
        displayPastEvents: z.boolean({ coerce: true }).default(false),
        displayPastEventsAfterFuture: z
          .boolean({ coerce: true })
          .default(false),
        sortByEventDateDesc: z.boolean({ coerce: true }).default(false),
        events: z.array(
          z.object({
            title: z.string().min(1),
            shortDescription: z
              .string()
              .max(MAX_SHORT_DESCRIPTION_LIMIT)
              .optional(),
            description: z.string().max(10000).optional(),
            beginsAt: z.date({ coerce: true }),
            endsAt: z.date({ coerce: true }),
            location: z
              .object({
                name: z.string(),
                link: z.string(),
              })
              .optional(),
            url: z.string().optional(),
          })
        ),
      })
      .parse(json);

    await collections.schedules.updateOne(
      {
        _id: schedule._id,
      },
      {
        $set: {
          name: parsed.name,
          pastEventDelay: Number(parsed.pastEventDelay),
          displayPastEvents: parsed.displayPastEvents,
          displayPastEventsAfterFuture: parsed.displayPastEventsAfterFuture,
          sortByEventDateDesc: parsed.sortByEventDateDesc,
          updatedAt: new Date(),
          events: parsed.events,
        },
      }
    );
  },

  delete: async function ({ params }) {
    await collections.schedules.deleteOne({
      _id: params.id,
    });

    throw redirect(303, `${adminPrefix()}/schedule`);
  },
};
