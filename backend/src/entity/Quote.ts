import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { Annotation } from "./Annotation"

@Entity()
export class Quote {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({
        type: "text"
    })
    text: string

    @Column({
        nullable: true
    })
    startingPage: string

    @Column({
        nullable: true
    })
    endingPage: string

    @Column({
        nullable: true
    })
    note: string

    // Relacionamentos

    //Pertence a *apenas 1* fichamento
    @ManyToOne(() => Annotation, (annotation) => annotation.quotes)
    annotation: Annotation

}