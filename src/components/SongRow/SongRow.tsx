import React, { Component, ChangeEvent } from 'react';

import Song from '../../models/song';
import SongHelper from '../../helpers/songHelper';

import SongStatus from '../SongStatus/SongStatus';
import SongHeader from '../SongHeader/SongHeader';
import SongDetails from '../SongDetails/SongDetails';

import { SongStatuses } from '../SongStatus/songStatuses';
import "./song-row.css";
import AlbumCover from '../../models/albumCover';

type Props = {
    file: File;
    song: Song;
    handleSongRemove: Function;
};

type State = {
    songStatus: SongStatuses;
    isExpanded: boolean;
    file: File;
    originalSong: Song;
    editableSong: Song;
};

class SongRow extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            songStatus: SongStatuses.Original,
            isExpanded: false,
            file: props.file,
            originalSong: props.song,
            editableSong: SongHelper.getCopyOfSong(props.song)
        };

        this.onSongRemove = this.onSongRemove.bind(this);
        this.onSongExpand = this.onSongExpand.bind(this);
        this.onSongDownload = this.onSongDownload.bind(this);
        this.onSongEdited = this.onSongEdited.bind(this);
    }

    onSongEdited(updatedSong: Song, updatedField: string, updatedValue: any) {
        const key = Object.keys(updatedField)[0];
        updatedSong[key] = updatedValue;
        const songStatus = SongHelper.areSongsDifferent(this.state.originalSong, updatedSong)
            ? SongStatuses.Modified
            : SongStatuses.Original;
        this.setState({ editableSong: updatedSong, songStatus });
    }

    onSongRemove() {
        this.props.handleSongRemove(this.state.file.name);
    }

    onSongExpand() {
        this.setState((prev) => ({ isExpanded: !prev.isExpanded }));
    }

    onSongDownload() {
        const { file, editableSong } = this.state;

        const reader = new FileReader();
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            SongHelper.downloadSong(arrayBuffer, editableSong, file.name);
            this.setState({ originalSong: SongHelper.getCopyOfSong(editableSong), editableSong, songStatus: SongStatuses.Saved });
        };
        reader.onerror = (err) => {
            console.log(err);
            debugger;
        };
        reader.readAsArrayBuffer(this.state.file);
    }

    onAlbumCoverUploaded = (e: ChangeEvent<HTMLInputElement>) => {
        // No file selected
        if (!e.target.files || e.target.files.length < 1)
            return;

        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onerror = (e) => { debugger; };
        reader.onload = () => {
            const coverArrayBuffer = reader.result as ArrayBuffer;
            const { editableSong } = this.state;

            if (editableSong.albumCover)
                editableSong.albumCover.setCover(coverArrayBuffer);
            else
                editableSong.albumCover = new AlbumCover(file.type, coverArrayBuffer, '', 'Front (Cover)');

            const songStatus = SongHelper.areSongsDifferent(this.state.originalSong, editableSong)
                ? SongStatuses.Modified
                : SongStatuses.Original;

            this.setState({ editableSong, songStatus });
        };
        reader.readAsArrayBuffer(file);
    }

    render() {
        const { originalSong, editableSong, songStatus, isExpanded } = this.state;

        return (
            <div className='row align-items-center'>
                <div className='col-1'>
                    <SongStatus status={songStatus} />
                </div>

                <div className='col-11'>
                    <div className='row mzt-row-song'>
                        <div className='col'>
                            <SongHeader
                                song={originalSong}
                                editableSong={editableSong}
                                handleClickDownload={this.onSongDownload}
                                handleClickExpand={this.onSongExpand}
                                handleClickRemove={this.onSongRemove} />


                            {isExpanded &&
                                <SongDetails
                                    originalSong={editableSong}
                                    handleSongEdit={this.onSongEdited}
                                    handleCoverUpload={this.onAlbumCoverUploaded} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default SongRow;