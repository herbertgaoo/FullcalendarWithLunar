<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhLocale from '@fullcalendar/core/locales/zh-cn';
import listPlugin from '@fullcalendar/list'
import { INITIAL_EVENTS, createEventId } from './event-utils'
import {calenderFormate} from './calendar'
import dayjs from "dayjs"

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // needs additional webpack config!

import bootstrap5Plugin from '@fullcalendar/bootstrap5';

export default {

  components: {
    FullCalendar // make the <FullCalendar> tag available
  },

  data: function() {
    return {
    isLunarShow: true,
      // 自定义日历视图
    lunarView: {
        dayGridMonth:{ dayCellContent: this.getDayGridMonthCellContent,
            dayHeaderContent: function(item) {
                let dayOfWeek = new Date().getDay()
                return {html: `<span class="${item.dow<dayOfWeek?"isPast":""} ${item.dow==dayOfWeek?"isToday":""}">${item.text}</span>`}
            }
        },
        timeGrid: { dayHeaderContent: this.getTimeGridHeaderContent,
            slotLabelContent: function(item) {
                return {html: item.time.milliseconds == 0?"":item.text} 
            }
        }
    },
      calendarOptions: {
        plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ,listPlugin ,bootstrap5Plugin],
        themeSystem: 'bootstrap5',
        headerToolbar: {
          left: 'today,prev,next,title',
          center: '',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },
        height: '100%',
        locales: [ zhLocale ],
        initialView: 'dayGridMonth',
        initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
        editable: true,
        selectable: true,
        selectMinDistance: 150,
        selectMirror: true,
        dayMaxEvents: true,
        weekends: true,
        nowIndicator: true,
        firstDay: 0,
        allDaySlot: true,
        dateClick: this.handleDateClick,
        select: this.handleDateSelect,
        eventClick: this.handleEventClick,
        eventsSet: this.handleEvents,
        slotDuration: "01:00:00",
        slotLabelFormat: {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        },
        moreLinkText: function(n) {
          return '还有 ' + n + ' 个日程'
        },
        slotLabelFormat: {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        },
        views: {
          dayGridMonth:{ dayCellContent: this.getDayGridMonthCellContent,
              dayHeaderContent: function(item) {
                  let dayOfWeek = new Date().getDay()
                  return {html: `<span class="${item.dow<dayOfWeek?"isPast":""} ${item.dow==dayOfWeek?"isToday":""}">${item.text}</span>`}
              }
          },
          timeGrid: { dayHeaderContent: this.getTimeGridHeaderContent,
              slotLabelContent: function(item) {
                  return {html: item.time.milliseconds == 0?"":item.text} 
              }
          }
      }    // 默认展示农历视图
        /* you can update a remote database when these fire:
        eventAdd:
        eventChange:
        eventRemove:
        */
        },
        currentEvents: []
    }
  },

  methods: {
    $day(value, format){
      if(!format)
        format = "YYYY-MM-DD"
      return dayjs(value).format(format)
    },
     /**
     * 月视图日期格子显示处理
     */
    getDayGridMonthCellContent(item){
        let htmlStr = `<div class="fc-daygrid-day-top-left">`
        let dateArr = this.$day(item.date, "YYYY-MM-D").split('-')
        let dayNum = dateArr[2]
        
        // 如果为当月第一天则显示月份
        dayNum = (dayNum == "1") ? this.$day(item.date, "M月D日") : dayNum; 
        htmlStr += `<span class="fc-daygrid-day-number-diy">${dayNum}</span>`

        // 如果显示农历，则处理农历显示数据
        if(this.isLunarShow) {
            let _dateF = calenderFormate.solar2lunar(dateArr[0],dateArr[1],dateArr[2])
            htmlStr += `<span class="lunar-day-title ${_dateF.lunarFestival?"lunar-festival":""}">${_dateF.lunarFestival || _dateF.Term || (_dateF.lDay==1? _dateF.IMonthCn: _dateF.IDayCn)}</span>`
        }

        return {html: htmlStr + `</div>`}
    },

    /**
     * 周、日视图日历表头处理
     */
    getTimeGridHeaderContent(item) {
        let htmlStr = `<div class="fc-timegrid-header ${item.isPast?"isPast":""} ${item.isToday?"isToday":""}">`
        let dateArr = this.$day(item.date, "YYYY-M-D").split('-')
        let dayNum = dateArr[2]
        
        item.text = item.text.replace(`${dateArr[1]}/${dateArr[2]}`, "")
        // 如果为当月第一天则显示月份
        htmlStr += `<span class="fc-timegrid-header-day-week">${item.text}</span>`
        htmlStr += `<div class="fc-timegrid-header-day-num"><span class="day-of-week">${dayNum}</span>`
        // 如果显示农历，则处理农历显示数据
        if(this.isLunarShow) {
            let _dateF = calenderFormate.solar2lunar(dateArr[0],dateArr[1],dateArr[2])
            htmlStr += `<span class="lunar-day-title ${_dateF.lunarFestival?"lunar-festival":""}">${_dateF.lunarFestival || _dateF.Term || (_dateF.lDay==1? _dateF.IMonthCn: _dateF.IDayCn)}</span>`
        }

        return {html: htmlStr + `</div></div>`}
    },

    handleWeekendsToggle() {
      this.calendarOptions.weekends = !this.calendarOptions.weekends // update a property
    },

    handleLunarToggle(ele) {
      this.isLunarShow = !this.isLunarShow
      this.getApi().setOption("views", this.lunarView)
    },

    handleDateClick(selectInfo) {
      console.log(selectInfo)
      let title = prompt('Please enter a new title for your event')
      let calendarApi = selectInfo.view.calendar

      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.dateStr,
          end: selectInfo.dateStr,
        })
      }
    },

    handleDateSelect(selectInfo) {
      let title = prompt('Please enter a new title for your event')
      let calendarApi = selectInfo.view.calendar

      calendarApi.unselect() // clear date selection

      if (title) {
        calendarApi.addEvent({
          id: createEventId(),
          title,
          start: selectInfo.startStr,
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        })
      }
    },

    handleEventClick(clickInfo) {
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        clickInfo.event.remove()
      }
    },

    handleEvents(events) {
      this.currentEvents = events
    },

    getApi() {
      return this.$refs.eventCale.getApi();
    }
  },
  created() {

  }
}
</script>

<template>
  <div class='demo-app'>
    <div class='demo-app-sidebar'>
      <div class='demo-app-sidebar-section'>
        <h2>Instructions</h2>
        <ul>
          <li>Select dates and you will be prompted to create a new event</li>
          <li>Drag, drop, and resize events</li>
          <li>Click an event to delete it</li>
        </ul>
      </div>
      <div class='demo-app-sidebar-section'>
        <label>
          <input
            type='checkbox'
            :checked='calendarOptions.weekends'
            @change='handleWeekendsToggle'
          />
          toggle weekends
        </label>
        <label>
          <input
            type='checkbox'
            :checked='isLunarShow'
            @change='handleLunarToggle'
          />
          toggle lunar
        </label>
      </div>
      <div class='demo-app-sidebar-section'>
        <h2>All Events ({{ currentEvents.length }})</h2>
        <ul>
          <li v-for='event in currentEvents' :key='event.id'>
            <b>{{ event.startStr }}</b>
            <i>{{ event.title }}</i>
          </li>
        </ul>
      </div>
    </div>
    <div class='demo-app-main'>
      <FullCalendar
        ref="eventCale"
        class='demo-app-calendar'
        :options='calendarOptions'
      >
        <template v-slot:eventContent='arg'>
          <b>{{ arg.timeText }}</b>
          <i>{{ arg.event.title }}</i>
        </template>
      </FullCalendar>
    </div>
  </div>
</template>

<style lang='less' scoped>

h2 {
  margin: 0;
  font-size: 16px;
}

ul {
  margin: 0;
  padding: 0 0 0 1.5em;
}

li {
  margin: 1.5em 0;
  padding: 0;
}

b { /* used for event dates/times */
  margin-right: 3px;
}

.demo-app {
  display: flex;
  min-height: 100%;
  font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
  font-size: 14px;
}

.demo-app-sidebar {
  width: 300px;
  line-height: 1.5;
  background: #eaf9ff;
  border-right: 1px solid #d3e2e8;
}

.demo-app-sidebar-section {
  padding: 2em;
}

.demo-app-main {
  flex-grow: 1;
  padding: 3em;
}

.fc { /* the calendar root */
  max-width: 1100px;
  margin: 0 auto;
}

/** calendar customize style start */
@{deep} .isPast{ 
    color: @easy-text-color-grey!important;
    .lunar-day-title{ color: @easy-text-color-grey!important; }
}
@{deep} .isToday{ color: @easy-color-primary!important}
/* the calendar root */
.fc {
    max-width: 1240px;
    margin: 0 auto;
}
/* the calendar header toolbar */
@{deep} .fc-toolbar-chunk>div {
    display: inline-flex;
}
@{deep} .lunar-day-title{
    font-size: 12px;
    margin-left: 5px;
    padding: 2px 0;
    color: @easy-text-color-grey;
    &.lunar-festival {
        color: @easy-color-primary;
    }
}
/* the calendar Month dayGrid view */
@{deep} .fc-dayGridMonth-view {
    .fc-scrollgrid{
        border: none;
        .fc-scrollgrid-section-header {
            .h_n(40px)!important;
            .w_n(100%);
            .flex;
            flex: none;
            .acenter;
            box-shadow: 0 2px 3px 0 rgba(0,0,0,6%);
            .color(@easy-text-color);

            .fc-col-header-cell.fc-day {
                text-align: left;
                padding: 6px;
            }
            * { border: none; }
        }
    }

    .fc-scrollgrid-section-body {
        &>td{ border: none;}
        .fc-daygrid-day-top {
            flex-direction: row;
            align-items: center;
            padding: 2px 8px;
            .fc-daygrid-day-top-left{
                display: inline-flex;
                align-items: flex-end;
                
                .fc-daygrid-day-number-diy {
                    font-family: @calendar-text;
                    font-size: 16px;
                    color: @easy-text-color;
                }
            }
        }
        .fc-daygrid-day {
            border: none;
            border-top: 0.5px solid #dee0e3;
            
            &.fc-day-today {
                background: @easy-color-primary-light;
                .fc-daygrid-day-number-diy{
                    text-align: center;
                    background-color: @easy-color-primary;
                    color: #fff;
                    border-radius: 50%;
                    height: 24px;
                    width: 24px;
                }
                &:before {
                    content: ' ';
                    display: block;
                    width: 100%;
                    height: 2px;
                    top: 0;
                    left: 0;
                    right: 0;
                    box-sizing: border-box;
                    background: @easy-color-primary;
                }
            }
            .fc-daygrid-event { 
                color: @easy-text-color-grey;
                margin: 0;
                padding: 0;
            }
        }
        .fc-daygrid-day-number{display: none;}
    }
}

/** the calendar time grid view */
@{deep} .fc-timeGridWeek-view, @{deep} .fc-timeGridDay-view {
    .fc-timegrid-slot-lane, .fc-timegrid-col, .fc-timegrid-axis, .fc-scrollgrid{
        border-color: #dddddd66;
    }
    .fc-timegrid-axis-frame{
        justify-content: center;
        color: @easy-text-color-placeholder;
    }
    .fc-col-header th, .fc-daygrid-body .fc-daygrid-day{
        border-bottom: none;
        border-color: #dddddd4d;
    }
    .fc-day-today{ background: @easy-color-primary-light;}
    .fc-timegrid-slot-label {
        border: none;
        height: 50px;

        .fc-timegrid-slot-label-frame {
            position: relative;
            height: 100%;
            .fc-timegrid-slot-label-cushion {
                width: 80px;
                display: inline-flex;
                color: @easy-text-color-placeholder;
                position: absolute;
                top: -6px;
                left: 0;
                line-height: 12px;
                font-size: 12px;
                justify-content: center;
            }
        }
    }
    .fc-scrollgrid-section {
        height: auto;
        &>td {border-bottom: none;}
        &.fc-scrollgrid-section-body {box-shadow: 0 2px 3px 0 rgba(0,0,0,6%);}
        .fc-timegrid-divider {
            height: 0;
            padding: 0;
            border: none;
        }
        .fc-daygrid-day-events{ margin-bottom: 0; }
    }
    
    .fc-col-header-cell-cushion {
        .flex;
        .fc-timegrid-header {
            .flex;
            flex-direction: column;
            align-items: flex-start;
            color: @easy-text-color;

            .fc-timegrid-header-day-week {
                font-size: 13px;
            }
            .fc-timegrid-header-day-num {
                    font-size: 26px;
                    line-height: 26px;
                    display: inline-flex;
                    align-items: flex-end;
                .lunar-day-title { padding: 0;}
            }
        }
    }
}
@{deep} .fc-timeGridDay-view .fc-day-today{background: none;}

/** calendar customize style end */

</style>
