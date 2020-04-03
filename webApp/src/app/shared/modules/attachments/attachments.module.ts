import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploaderListComponent, ProfilepicUploaderComponent } from './components';
import { AttachmentService } from './services';

// import filepond module
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';

registerPlugin(
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginImageCrop,
  FilePondPluginImageResize,
  FilePondPluginImageTransform
);

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faFileWord,
  faFilePowerpoint,
  faFileImage,
  faFileVideo,
  faFileAlt,
  faFileArchive,
  faFile,
  faTrashAlt,
  faFolderPlus,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

@NgModule({
  imports: [CommonModule, FilePondModule, FontAwesomeModule],
  declarations: [UploaderListComponent, ProfilepicUploaderComponent],
  exports: [UploaderListComponent, ProfilepicUploaderComponent],
  providers: [AttachmentService],
})
export class AttachmentsModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(
      faFile,
      faFileWord,
      faFilePowerpoint,
      faFileImage,
      faFileVideo,
      faFileAlt,
      faFileArchive,
      faTrashAlt,
      faFolderPlus,
      faCheck
    );
  }
}
