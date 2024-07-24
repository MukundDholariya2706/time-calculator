import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-time-inputs',
  templateUrl: './time-inputs.component.html',
  styleUrls: ['./time-inputs.component.scss']
})
export class TimeInputsComponent implements OnInit {
  timeForm!: FormGroup;
  totalDifference: { hours: number, minutes: number } = { hours: 0, minutes: 0 };

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.timeForm = this.fb.group({
      times: this.fb.array([this.createTimeGroup()])
    });
  }

  get times(): FormArray {
    return this.timeForm.get('times') as FormArray;
  }

  createTimeGroup(): FormGroup {
    return this.fb.group({
      start: [''],
      end: [''],
      difference: this.fb.group({
        hours: [0],
        minutes: [0]
      })
    });
  }

  addTime() {
    this.times.push(this.createTimeGroup());
  }

  removeTime(index: number) {
    this.times.removeAt(index);
    this.calculateDifference();
  }

  setCurrentTime(index: number, controlName: 'start' | 'end') {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const timeGroup = this.times.at(index) as FormGroup;
    timeGroup.get(controlName)?.setValue(currentTime);
    this.calculateDifference();
  }

  calculateDifference() {
    let totalMinutes = 0;
    this.times.controls.forEach(group => {
      const start = group.get('start')?.value;
      const end = group.get('end')?.value;
      if (start && end) {
        const startTime = new Date(`1970-01-01T${start}:00`);
        const endTime = new Date(`1970-01-01T${end}:00`);
        let difference = (endTime.getTime() - startTime.getTime()) / 60000;
        
        if (difference < 0) {
          difference += 24 * 60; // Handle cases where end time is past midnight
        }
        
        const hours = Math.floor(difference / 60);
        const minutes = difference % 60;
        group.get('difference')?.patchValue({ hours, minutes });
        totalMinutes += difference;
      } else {
        group.get('difference')?.patchValue({ hours: 0, minutes: 0 });
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    this.totalDifference = { hours: totalHours, minutes: remainingMinutes };
  }
}
