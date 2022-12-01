import en from './en';
import de from './de';

export const messages = {
  en: {
    menu: {
      streams: 'Streams',
      filter: 'Filter',
      random: 'Random',
      favs: 'Favs',
      jobs: 'Jobs',
      admin: 'Admin'
    },
    recording: {
      durationMinutes: '{0}min',
      ago: '{0}',
      bitRate: 'Bitrate',
      bitRateMBit: '{0}MBit',
      resolution: 'Resolution',
      started: 'Created',
      convert: 'Convert'
    },
    navtop: {
      addStream: 'Add Stream',
      stopRecording: 'Stop',
      startRecording: 'Start',
      jobsLoading: 'Loading...'
    },
    videoView: {
      button: {
        destroy: 'Delete'
      }
    },
    filter: {
      label: {
        orderBy: 'Order By',
        order: 'Order',
        limit: 'Limit'
      }
    },
    job: {
      tab: {
        workerJobs: 'Worker Jobs',
        recordings: 'Recordings'
      }
    },
    jobTable: {
      col: {
        pid: 'PID',
        channel: 'Channel',
        file: 'File',
        task: 'Task',
        progress: 'Progress',
        created: 'Created',
        destroy: 'Destroy',
      },
      loading: 'Loading...',
      noJobs: 'No Jobs'
    }
  },
};

export const datetimeFormats = {
  'en': {
    short: {
      year: 'numeric', month: 'short', day: 'numeric'
    },
    long: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric'
    }
  },
  'de': {
    short: {
      year: 'numeric', month: 'short', day: 'numeric'
    },
    long: {
      year: 'numeric', month: 'short', day: 'numeric',
      weekday: 'short', hour: 'numeric', minute: 'numeric'
    }
  },
};
