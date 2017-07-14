import React, { Component } from 'react';

import createEventHandlers from './create-event-handlers';
import getCurriedOnLoad from './helpers/get-curried-on-load';
import getPlayerOpts from './helpers/get-player-opts';
import initialize from './helpers/initialize';
import installPlayerScript from './helpers/install-player-script';

import defaultProps from './default-props';
import propTypes from './prop-types';

const displayName = 'ReactJWPlayer';

class ReactJWPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adHasPlayed: false,
      hasPlayed: false,
      hasFired: {},
      player: null,
    };
    this.eventHandlers = createEventHandlers(this);
    this.uniqueScriptId = 'jw-player-script';
    this._initialize = this._initialize.bind(this);
  }
  componentDidMount() {
    const isJWPlayerScriptLoaded = !!window.jwplayer;
    if (isJWPlayerScriptLoaded) {
      this._initialize();
      return;
    }

    const existingScript = document.getElementById(this.uniqueScriptId);

    if (!existingScript) {
      installPlayerScript({
        context: document,
        onLoadCallback: this._initialize,
        scriptSrc: this.props.playerScript,
        uniqueScriptId: this.uniqueScriptId,
      });
    } else {
      existingScript.onload = getCurriedOnLoad(existingScript, this._initialize);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.file === this.props.file) {
      return;
    }

    // remove and create new player
    let { player } = this.state;
    if (player) {
        player.remove();
    }
    player = window.jwplayer(nextProps.playerId);

    const component = this;
    const playerOpts = getPlayerOpts(nextProps);

    if (this.state.hasPlayed) {
      playerOpts.autostart = true;
    }

    initialize({ component, player, playerOpts });
    this.setState({ player });
  }
  componentWillUnmount() {
    const { player } = this.state;
    if (player) {
      player.remove();
    }
  }
  _initialize() {
    const component = this;
    const player = window.jwplayer(this.props.playerId);
    const playerOpts = getPlayerOpts(this.props);

    initialize({ component, player, playerOpts });
    this.setState({ player });
  }
  render() {
    return (
      <div className={this.props.className} id={this.props.playerId} />
    );
  }
}

ReactJWPlayer.defaultProps = defaultProps;
ReactJWPlayer.displayName = displayName;
ReactJWPlayer.propTypes = propTypes;
export default ReactJWPlayer;
