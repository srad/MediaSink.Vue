import moment from 'moment';

export default {
  menu: {
    streams: 'Streams',
    filter: 'Filter',
    latest: 'Latest',
    random: 'Random',
    favs: 'Favs',
    jobs: 'Jobs',
    admin: 'Admin',
    start: 'Start',
    stop: 'Stop',
    addChannel: 'Add Channel',
  },
  search: {
    searchInput: 'search ... #tag'
  },
  navtop: {
    addStream: 'Add Stream',
    stopRecording: 'Stop',
    startRecording: 'Start',
    jobsLoading: 'Loading...'
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
  },
  recording: {
    durationMinutes: '{0}min',
    bitRate: 'Bitrate',
    bitRateMBit: (ctx: any) => `${(ctx.list(0) / 1000 / 1000).toFixed(1)} MBit/s`,
    resolution: 'Resolution',
    started: 'Started at',
    convert: 'Convert to',
    ago: (ctx: any) => moment(ctx.list(0)).fromNow()
  },
  channel: {
    destroy: 'Delete the channel "{0}"?',
    rec: 'Recording',
    recShort: 'Rec',
    offline: 'Offline',
    offlineShort: 'Off',
    disabled: 'Disabled',
  },
  filter: {
    orderBy: 'Order by',
    order: 'Order',
    limit: 'Limit',
    createdAt: 'Created At',
    fileSize: 'File size',
    duration: 'Duration',
    asc: 'Asc',
    desc: 'Desc',
    25: '25',
    50: '50',
    100: '100',
    200: '200',
  },
  channelModal: {
    titleEdit: 'Edit Channel',
    titleAdd: 'Add Channel',
    url: 'URL',
    displayName: 'Display name',
    channelName: 'Channel name',
    skipStart: 'Skip start',
    pause: 'Pause Recording\n',
    infoDisplay: 'Displayed as stream name. Can be changed at any time.',
    infoChannel: 'This field is the file system folder name and cannot be changed.',
    infoSkipStart: 'Some broadcasters have certain number of seconds ads at the video start. Define how many seconds at start should be skipped when recording, i.e. for Twitch 15s.',
    infoPause: 'Do not record as long as paused.'
  },
  recordings: {
    destroy: 'Delete recording "{filename}"?',
    generatePreview: 'Generate a new preview?',
    convert: 'Convert "{filename}" video to type "{mediaType}"?'
  },
  recorder: {
    start: 'Start recording?',
    stop: 'Do you want to stop all recordings?'
  },
  crud: {
    destroy: 'Do you want to delete "{0}"?'
  },
  admin: {
    regenPoster: 'Regenerate all posters?'
  },
  videoView: {
    button: {
      destroy: 'Delete',
      cut: 'Cut',
    },
    destroy: 'Delete video "{0}"?',
    exportSegments: 'Export selected segments?',
    updateInfo: 'Check all durations and update in database?',
    segment: {
      start: 'Start',
      end: 'End',
      destroy: 'Del',
    }
  },
  button: {
    destroy: 'Delete'
  }
};
