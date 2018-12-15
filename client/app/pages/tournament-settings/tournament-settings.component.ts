import {Component, OnInit} from '@angular/core';
import {TournamentSettingsService} from "../../shared/services/tournament-settings.service";
import {Notifications} from "../../shared/services/notifications.service";
import {st} from "../../../../node_modules/@angular/core/src/render3";
import {DeleteService} from "../../shared/services/delete-service.service";
import {TournamentDataService} from "../../shared/services/tournament-data.service";
import {forkJoin} from "rxjs";

@Component({
    selector: 'app-tournament-settings',
    templateUrl: './tournament-settings.component.html',
    styleUrls: ['./tournament-settings.component.css']
})
export class TournamentSettingsComponent implements OnInit {

    public settings: object;
    public loading: boolean = true;
    public hasDataInDb = false;

    public MIN_AMOUNT_OF_ROUNDS = 0;
    public MAX_AMOUNT_OF_ROUNDS = 5

    constructor(private tournamentSettingsService: TournamentSettingsService,
                public tournamentDataService: TournamentDataService,
                private notification: Notifications,
                private deleteModalsService: DeleteService) {
    }

    ngOnInit() {
        this.reload();
        this.tournamentDataService.dataReload.subscribe(() => {
            this.reload()
        })
    }

    private reload() {
        this.tournamentSettingsService.getAllSettings().subscribe({
            next: (settings: object) => {
                this.haveDataInDb()
                this.settings = {
                    tournamentTitle: {
                        display: 'Tournament Title',
                        value: settings['tournamentTitle'],
                        name: 'tournamentTitle'
                    },
                    tournamentStage: {
                        display: 'Stage',
                        value: settings['tournamentStage'],
                        name: 'tournamentStage'
                    },
                    numberOfPracticeRounds: {
                        display: 'Practice rounds',
                        value: settings['numberOfPracticeRounds'],
                        name: 'numberOfPracticeRounds'
                    },
                    numberOfRankingRounds: {
                        display: 'Ranking rounds',
                        value: settings['numberOfRankingRounds'],
                        name: 'numberOfRankingRounds'
                    }
                }
                this.tournamentSettingsService.getStages().subscribe(
                    (stages: any) => {
                        this.settings['tournamentStage'].options = stages
                        this.loading = false;
                    },
                    err => {
                        this.notification.error("An error occurred while trying to load stages. \n Maybe you did not load any matches?")
                        this.loading = false;
                    }
                )
            },
            error: (err) => {
                this.notification.error("There was a problem getting the settings.")
            }
        });
    }

    save(setting: string) {
        this.tournamentSettingsService.saveSetting(setting, this.settings[setting].value).subscribe(
            response => {
                this.loading = false;
                this.notification.success(`${this.settings[setting].display} saved successfully`)
            },
            err => {
                this.notification.error("Oh no! Something went wrong while trying to save...")
            })
    }

    saveNumberOFRounds() {
        if (this.doesValueBetween(this.settings['numberOfPracticeRounds'].value, this.MIN_AMOUNT_OF_ROUNDS, this.MAX_AMOUNT_OF_ROUNDS) &&
            this.doesValueBetween(this.settings['numberOfRankingRounds'].value, this.MIN_AMOUNT_OF_ROUNDS, this.MAX_AMOUNT_OF_ROUNDS)) {
            forkJoin(this.tournamentSettingsService.saveSetting('numberOfPracticeRounds', this.settings['numberOfPracticeRounds'].value),
                     this.tournamentSettingsService.saveSetting('numberOfRankingRounds', this.settings['numberOfRankingRounds'].value))
                .subscribe(
                    response => {
                        this.notification.success(`Number of rounds saved successfully`)
                    },
                    error => {
                        this.notification.error("Oh no! Something went wrong while trying to save number of rounds")
                    }
                )
        } else {
            this.notification.error(`Valid rounds per stage is between ${this.MIN_AMOUNT_OF_ROUNDS} and ${this.MAX_AMOUNT_OF_ROUNDS}`)
        }

    }

    doesValueBetween(value, min, max) {
        return value >= min && value <= max;
    }

    setDeleteModel(model) {
        this.deleteModalsService.setDeleteModel(model);
    }

    haveDataInDb() {
        this.tournamentDataService.hasData().subscribe(result => {
            this.hasDataInDb = result
        })
    }
}


