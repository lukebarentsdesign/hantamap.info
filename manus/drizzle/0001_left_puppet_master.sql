CREATE TABLE `email_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`verified` int NOT NULL DEFAULT 0,
	`subscribed_at` timestamp NOT NULL DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `outbreak_cases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`location` varchar(255) NOT NULL,
	`latitude` varchar(50),
	`longitude` varchar(50),
	`confirmed_count` int NOT NULL DEFAULT 0,
	`suspected_count` int NOT NULL DEFAULT 0,
	`deaths` int NOT NULL DEFAULT 0,
	`date_reported` timestamp NOT NULL,
	`severity_level` enum('low','moderate','high','critical') NOT NULL DEFAULT 'moderate',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `outbreak_cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_url` varchar(512),
	`headline` varchar(512) NOT NULL,
	`summary` text NOT NULL,
	`region` varchar(255),
	`date_published` timestamp NOT NULL,
	`language` varchar(10) NOT NULL DEFAULT 'en',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
