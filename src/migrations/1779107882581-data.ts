import { MigrationInterface, QueryRunner } from "typeorm";

export class Data1779107882581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("INSERT INTO `bookings` VALUES (1,'RELEASED',NULL),(2,'APPROVED',NULL),(3,'APPLYING',NULL),(4,'APPROVED',NULL),(5,'APPLYING','booking note'),(6,'APPROVED','booking note'),(7,'APPLYING','来自会议室列表页'),(8,'RELEASED','早会'),(9,'APPROVED','摸鱼');");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("TRUNCATE TABLE booking");
    }

}
