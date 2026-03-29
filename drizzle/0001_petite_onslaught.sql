CREATE TABLE "user_organizers" (
	"user_id" text NOT NULL,
	"organizer_id" integer NOT NULL,
	CONSTRAINT "user_organizers_user_id_organizer_id_pk" PRIMARY KEY("user_id","organizer_id")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "notify" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_organizers" ADD CONSTRAINT "user_organizers_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_organizers" ADD CONSTRAINT "user_organizers_organizer_id_organizers_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."organizers"("id") ON DELETE cascade ON UPDATE no action;
