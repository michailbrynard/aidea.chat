create type "public"."request_status" as enum ('initiated', 'succeeded', 'failed');

create sequence "public"."requests_id_seq";

create table "public"."requests" (
    "id" integer not null default nextval('requests_id_seq'::regclass),
    "user_id" uuid not null,
    "created" timestamp with time zone default CURRENT_TIMESTAMP,
    "prompt_tokens" integer,
    "completion_tokens" integer,
    "model" character varying(50),
    "status" request_status not null default 'initiated'::request_status
);


alter table "public"."requests" enable row level security;

alter sequence "public"."requests_id_seq" owned by "public"."requests"."id";

CREATE UNIQUE INDEX requests_pkey ON public.requests USING btree (id);

alter table "public"."requests" add constraint "requests_pkey" PRIMARY KEY using index "requests_pkey";

alter table "public"."requests" add constraint "requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."requests" validate constraint "requests_user_id_fkey";


