import MessageComposer from './MessageComposer.react';
import MessageListItem from './MessageListItem.react';
import SearchSection from './SearchSection.react';
import Settings from './Settings.react';
import MessageStore from '../../stores/MessageStore';
import React, { Component } from 'react';
import ThreadStore from '../../stores/ThreadStore';
import * as Actions from '../../actions/';
import SettingStore from '../../stores/SettingStore';
import SearchIcon from 'material-ui/svg-icons/action/search';
import AppBar from 'material-ui/AppBar';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ArrowDropLeft from 'material-ui/svg-icons/navigation/arrow-back';
import IconMenu from 'material-ui/IconMenu';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { addUrlProps, UrlQueryParamTypes } from 'react-url-query';
import loadingGIF from '../images/loading.gif';
import Cookies from 'universal-cookie';
import Login from '../Auth/Login/Login.react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import { CirclePicker } from 'react-color';

const cookies = new Cookies();

function getStateFromStores() {
  return {
    messages: MessageStore.getAllForCurrentThread(),
    thread: ThreadStore.getCurrent(),
    darkTheme: SettingStore.getTheme(),
    search: SettingStore.getSearchMode(),
    showLoading: MessageStore.getLoadStatus(),
    open: false,
    showSettings: false,
    showThemeChanger: false,
    header: '#607d8b',
    pane: '',
    textarea: '',
    composer:'',
    body:''
  };
}

function getMessageListItem(message) {
  return (
    <MessageListItem
      key={message.id}
      message={message}
    />
  );
}


function getLoadingGIF() {
  let messageContainerClasses = 'message-container SUSI';
  const LoadingComponent = (
    <li className='message-list-item'>
      <section className={messageContainerClasses}>
        <img src={loadingGIF}
          style={{ height: '10px', width: 'auto' }}
          alt='please wait..' />
      </section>
    </li>
  );
  return LoadingComponent;
}

const urlPropsQueryConfig = {
  dream: { type: UrlQueryParamTypes.string }
};

let Logged = (props) => (
  <IconMenu
    {...props}
    iconButtonElement={
      <IconButton
      iconStyle={{ fill: 'white' }}><MoreVertIcon /></IconButton>
    }
    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
  >
  </IconMenu>
)


class MessageSection extends Component {

  static propTypes = {
    dream: PropTypes.string
  }

  static defaultProps = {
    dream: ''
  }

  state = {
    open: false
  };
  constructor(props) {
    super(props);
    this.state = getStateFromStores();
  }

  handleColorChange = (name,color) => {
    // Current Changes
  }

  handleChangeComplete = (name, color) => {
     // Send these Settings to Server
     let state = this.state;
     if(name === 'header'){
       state.header = color.hex;
     }
     else if(name === 'body'){
       state.body= color.hex;
       document.body.style.setProperty('background', color.hex);
     }
     else if(name ===  'pane') {
       state.pane = color.hex;
     }
     else if(name === 'composer'){
       state.composer = color.hex;

     }
     else if(name === 'textarea') {
       state.textarea = color.hex;

     }
     this.setState(state);
  };

  handleOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({
      open: false,
      showSettings: false,
      showThemeChanger: false
    });
  };

  handleThemeChanger = () => {
    this.setState({showThemeChanger: true})
  }

  handleSettings = () => {
    this.setState({showSettings: true});
  }

  componentDidMount() {
    this._scrollToBottom();
    MessageStore.addChangeListener(this._onChange.bind(this));
    ThreadStore.addChangeListener(this._onChange.bind(this));
    SettingStore.addChangeListener(this._onChange.bind(this));
    // Check Logged in
    if (cookies.get('loggedIn')) {
      Logged = (props) => (
        <IconMenu
          {...props}
          iconButtonElement={
            <IconButton iconStyle={{ fill: 'white' }}>
              <MoreVertIcon /></IconButton>
          }
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        >
          <MenuItem primaryText="Settings"
            onClick={this.handleSettings} />
          <MenuItem primaryText="Chat Anonymously"
            containerElement={<Link to="/logout" />} />
          <MenuItem primaryText="Logout"
            containerElement={<Link to="/logout" />} />
            <MenuItem
              primaryText="Change Theme"
              leftIcon={<ArrowDropLeft />}
              menuItems={[
                <MenuItem
                  key="light"
                  primaryText="Light Theme"
                  onClick={() => { changeLight() }} />,
                <MenuItem
                  key="dark"
                  primaryText="Dark Theme"
                  onClick={() => {changeDark() }} />,
                 <MenuItem primaryText="Custom Theme"
                 key="custom"
                  onClick={this.handleThemeChanger} />
                ]}
              />
        </IconMenu>)
      return <Logged />
    }
    // If Not Logged In
    Logged = (props) => (
      <IconMenu
        {...props}
        iconButtonElement={
          <IconButton iconStyle={{ fill: 'white' }}>
            <MoreVertIcon /></IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="Login" onTouchTap={this.handleOpen} />
        <MenuItem primaryText="Sign Up"
          containerElement={<Link to="/signup" />} />
        <MenuItem
          primaryText="Change Theme"
          leftIcon={<ArrowDropLeft />}
          menuItems={[
            <MenuItem
              key="light"
              primaryText="Light Theme"
              onClick={() => { changeLight() }} />,
            <MenuItem
              key="dark"
              primaryText="Dark Theme"
              onClick={() => {changeDark() }} />,
            <MenuItem primaryText="Custom Theme"
            key="custom"
              onClick={this.handleThemeChanger} />
            ]}
          />
      </IconMenu>)

    return <Logged />
  }

  componentWillUnmount() {
    MessageStore.removeChangeListener(this._onChange.bind(this));
    ThreadStore.removeChangeListener(this._onChange.bind(this));
    SettingStore.removeChangeListener(this._onChange.bind(this));
  }

  themeChangerLight(event) {
    if(!this.state.darkTheme){
      Actions.themeChanged(!this.state.darkTheme);
    }
  }

  themeChangerDark(event) {
    if(this.state.darkTheme){
      Actions.themeChanged(!this.state.darkTheme);
    }
  }

  componentWillMount() {

    if (this.props.location) {
      if (this.props.location.state) {
        if (this.props.location.state.hasOwnProperty('showLogin')) {
          let showLogin = this.props.location.state.showLogin;
          this.setState({ open: showLogin });
        }
      }
    }

    SettingStore.on('change', () => {
      this.setState({
        darkTheme: SettingStore.getTheme()
      })
      if (!this.state.darkTheme) {
        document.body.className = 'white-body';
      }
      else {
        document.body.className = 'dark-body';
      }
    })
  }

  render() {

    const bodyStyle = {
      'padding': 0,
      textAlign: 'center'
    }
    const {
      dream
    } = this.props;
    var backgroundCol;
    let topBackground = this.state.darkTheme ? '' : 'dark';

    if (topBackground === 'dark') {
      backgroundCol =  '#19324c';
    }
    else {
      backgroundCol = '#607d8b';

    }
    const actions = <RaisedButton
      label="Cancel"
      backgroundColor={
        SettingStore.getTheme() ? '#607D8B' : '#19314B'}
      labelColor="#fff"
      width='200px'
      keyboardFocused={true}
      onTouchTap={this.handleClose}
    />;
    const componentsList = [
      {'id':1, 'component':'header', 'name': 'Header'},
      {'id':2, 'component': 'pane', 'name': 'Message Pane'},
      {'id':3, 'component':'body', 'name': 'Body'},
      {'id':4, 'component':'composer', 'name': 'Composer'},
      {'id':5, 'component':'textarea', 'name': 'Textarea'}
    ];

    const components = componentsList.map((component) => {
        return <div key={component.id} className='circleChoose'>
                  <h4>Change color of {component.name}:</h4>
                  <CirclePicker  color={component}
        onChangeComplete={ this.handleChangeComplete.bind(this,component.component) }
        onChange={this.handleColorChange.bind(this,component.id)}>
        </CirclePicker></div>
    })

    backgroundCol = this.state.header;
    var body = this.state.body;
    var pane = this.state.pane;
    var composer = this.state.composer;

    let messageListItems = this.state.messages.map(getMessageListItem);
    if (this.state.thread) {
      if (!this.state.search) {
        const rightButtons = (
          <div style={{marginTop: '-4px'}}>
            <IconButton tooltip="Search"
            iconStyle={{ fill: 'white' }}
            onTouchTap={this._onClickSearch.bind(this)}>
              <SearchIcon />
            </IconButton>
            <Logged />
          </div>);
        return (
          <div className={topBackground} style={{background:body}}>
            <header className='message-thread-heading'
            style={{ backgroundColor: backgroundCol }}>
              <AppBar
                iconElementLeft={<IconButton></IconButton>}
                iconElementRight={rightButtons}
                className="app-bar"
                style={{ backgroundColor: backgroundCol,
                height: '56px' }}
                titleStyle={{height:'56px'}}
              />
            </header>

            <div className='message-pane'>
              <div className='message-section'>
                <ul
                  className='message-list'
                  ref={(c) => { this.messageList = c; }}
                  style={{background:pane}}>
                  {messageListItems}
                  {this.state.showLoading && getLoadingGIF()}
                </ul>
                <div className='compose' style={{background:composer}}>
                  <MessageComposer
                    threadID={this.state.thread.id}
                    theme={this.state.darkTheme}
                    dream={dream}
                    textarea={this.state.textarea} />
                </div>
              </div>
            </div>
            <Dialog
            className='dialogStyle'
              actions={actions}
              modal={false}
              open={this.state.open}
              autoScrollBodyContent={true}
              bodyStyle={bodyStyle}
              contentStyle={{width: '35%',minWidth: '300px'}}
              onRequestClose={this.handleClose}>
              <Login {...this.props} />
            </Dialog>
            <Dialog
              actions={actions}
              modal={false}
              open={this.state.showSettings}
              autoScrollBodyContent={true}
              bodyStyle={bodyStyle}
              onRequestClose={this.handleClose}>
              <div>
                <Settings {...this.props} />
              </div>
            </Dialog>
            <Dialog
              actions={actions}
              modal={false}
              open={this.state.showThemeChanger}
              autoScrollBodyContent={true}
              bodyStyle={bodyStyle}
              onRequestClose={this.handleClose}>
              <div>
                {components}
              </div>
            </Dialog>
          </div>
        );
      }
      if (this.state.search) {
        return (
          <SearchSection messages={this.state.messages}
            theme={this.state.darkTheme}
          />
        );
      }
    }

    return <div className='message-section'></div>;
  }

  componentDidUpdate() {
    if (this.state.darkTheme) {
      document.body.className = 'white-body';
    }
    else {
      document.body.className = 'dark-body';
    }
    this._scrollToBottom();
  }

  _scrollToBottom() {
    let ul = this.messageList;
    if (ul) {
      ul.scrollTop = ul.scrollHeight;
    }
  }

  _onClickSearch() {
    Actions.ToggleSearch();
  }

  /**
   * Event handler for 'change' events coming from the MessageStore
   */
  _onChange() {
    this.setState(getStateFromStores());
  }

};
function changeLight() {
  let messageSection = new MessageSection();
  messageSection.themeChangerLight();
}
function changeDark() {
  let messageSection = new MessageSection();
  messageSection.themeChangerDark();
}


Logged.muiName = 'IconMenu';

MessageSection.propTypes = {
  location: PropTypes.object,
};

export default addUrlProps({ urlPropsQueryConfig })(MessageSection);
